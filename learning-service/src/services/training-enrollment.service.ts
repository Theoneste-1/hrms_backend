// src/services/training-enrollment.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class TrainingEnrollmentService {
  async create(data: any) {
    try {
      const trainingEnrollment = await prismaClient.getClient().trainingEnrollment.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Training enrollment created: ${trainingEnrollment.id}`);
      return trainingEnrollment;
    } catch (error) {
      logger.error('Error creating training enrollment:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, employeeId, trainingProgramId, status, page, limit } = query;
    const cacheKey = `training_enrollments:${companyId}:${employeeId || 'all'}:${trainingProgramId || 'all'}:${status || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (employeeId) where.employeeId = employeeId;
      if (trainingProgramId) where.trainingProgramId = trainingProgramId;
      if (status) where.status = status;

      const trainingEnrollments = await prismaClient.getClient().trainingEnrollment.findMany({
        where,
        skip,
        take: limit,
        include: { employee: true, trainingProgram: true },
      });

      await redisClient.set(cacheKey, JSON.stringify(trainingEnrollments), 3600);
      return trainingEnrollments;
    } catch (error) {
      logger.error('Error fetching training enrollments:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `training_enrollment:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const trainingEnrollment = await prismaClient.getClient().trainingEnrollment.findUnique({
        where: { id, companyId },
        include: { employee: true, trainingProgram: true },
      });

      if (!trainingEnrollment) throw new Error('Training enrollment not found');

      await redisClient.set(cacheKey, JSON.stringify(trainingEnrollment), 3600);
      return trainingEnrollment;
    } catch (error) {
      logger.error(`Error fetching training enrollment ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const trainingEnrollment = await prismaClient.getClient().trainingEnrollment.update({
        where: { id },
        data,
      });
      await this.invalidateCache(trainingEnrollment.companyId);
      logger.info(`Training enrollment updated: ${id}`);
      return trainingEnrollment;
    } catch (error) {
      logger.error(`Error updating training enrollment ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const trainingEnrollment = await prismaClient.getClient().trainingEnrollment.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Training enrollment deleted: ${id}`);
      return trainingEnrollment;
    } catch (error) {
      logger.error(`Error deleting training enrollment ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`training_enrollments:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}