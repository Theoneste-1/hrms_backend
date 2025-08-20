// src/services/performance-review.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class PerformanceReviewService {
  async create(data: any) {
    try {
      const performanceReview = await prismaClient.getClient().performanceReview.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Performance review created: ${performanceReview.id}`);
      return performanceReview;
    } catch (error) {
      logger.error('Error creating performance review:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, employeeId, reviewerId, status, page, limit } = query;
    const cacheKey = `performance_reviews:${companyId}:${employeeId || 'all'}:${reviewerId || 'all'}:${status || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (employeeId) where.employeeId = employeeId;
      if (reviewerId) where.reviewerId = reviewerId;
      if (status) where.status = status;

      const performanceReviews = await prismaClient.getClient().performanceReview.findMany({
        where,
        skip,
        take: limit,
        include: { employee: true, reviewer: true },
      });

      await redisClient.set(cacheKey, JSON.stringify(performanceReviews), 3600);
      return performanceReviews;
    } catch (error) {
      logger.error('Error fetching performance reviews:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `performance_review:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const performanceReview = await prismaClient.getClient().performanceReview.findUnique({
        where: { id, companyId },
        include: { employee: true, reviewer: true },
      });

      if (!performanceReview) throw new Error('Performance review not found');

      await redisClient.set(cacheKey, JSON.stringify(performanceReview), 3600);
      return performanceReview;
    } catch (error) {
      logger.error(`Error fetching performance review ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const performanceReview = await prismaClient.getClient().performanceReview.update({
        where: { id },
        data,
      });
      await this.invalidateCache(performanceReview.companyId);
      logger.info(`Performance review updated: ${id}`);
      return performanceReview;
    } catch (error) {
      logger.error(`Error updating performance review ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const performanceReview = await prismaClient.getClient().performanceReview.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Performance review deleted: ${id}`);
      return performanceReview;
    } catch (error) {
      logger.error(`Error deleting performance review ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`performance_reviews:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}