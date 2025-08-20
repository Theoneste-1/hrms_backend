// src/services/position.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class PositionService {
  async create(data: any) {
    try {
      const position = await prismaClient.getClient().position.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Position created: ${position.id}`);
      return position;
    } catch (error) {
      logger.error('Error creating position:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, departmentId, page, limit } = query;
    const cacheKey = `positions:${companyId}:${departmentId || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (departmentId) where.departmentId = departmentId;

      const positions = await prismaClient.getClient().position.findMany({
        where,
        skip,
        take: limit,
        include: { department: true, employees: true },
      });

      await redisClient.set(cacheKey, JSON.stringify(positions), 3600);
      return positions;
    } catch (error) {
      logger.error('Error fetching positions:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `position:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const position = await prismaClient.getClient().position.findUnique({
        where: { id, companyId },
        include: { department: true, employees: true },
      });

      if (!position) throw new Error('Position not found');

      await redisClient.set(cacheKey, JSON.stringify(position), 3600);
      return position;
    } catch (error) {
      logger.error(`Error fetching position ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const position = await prismaClient.getClient().position.update({
        where: { id },
        data,
      });
      await this.invalidateCache(position.companyId);
      logger.info(`Position updated: ${id}`);
      return position;
    } catch (error) {
      logger.error(`Error updating position ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const position = await prismaClient.getClient().position.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Position deleted: ${id}`);
      return position;
    } catch (error) {
      logger.error(`Error deleting position ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`positions:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}