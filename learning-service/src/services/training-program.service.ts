// src/services/training-program.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class TrainingProgramService {
  async create(data: any) {
    try {
      const trainingProgram = await prismaClient.getClient().trainingProgram.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Training program created: ${trainingProgram.id}`);
      return trainingProgram;
    } catch (error) {
      logger.error('Error creating training program:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, status, page, limit } = query;
    const cacheKey = `training_programs:${companyId}:${status || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (status) where.status = status;

      const trainingPrograms = await prismaClient.getClient().trainingProgram.findMany({
        where,
        skip,
        take: limit,
        include: { enrollments: true },
      });

      await redisClient.set(cacheKey, JSON.stringify(trainingPrograms), 3600);
      return trainingPrograms;
    } catch (error) {
      logger.error('Error fetching training programs:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `training_program:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const trainingProgram = await prismaClient.getClient().trainingProgram.findUnique({
        where: { id, companyId },
        include: { enrollments: true },
      });

      if (!trainingProgram) throw new Error('Training program not found');

      await redisClient.set(cacheKey, JSON.stringify(trainingProgram), 3600);
      return trainingProgram;
    } catch (error) {
      logger.error(`Error fetching training program ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const trainingProgram = await prismaClient.getClient().trainingProgram.update({
        where: { id },
        data,
      });
      await this.invalidateCache(trainingProgram.companyId);
      logger.info(`Training program updated: ${id}`);
      return trainingProgram;
    } catch (error) {
      logger.error(`Error updating training program ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const trainingProgram = await prismaClient.getClient().trainingProgram.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Training program deleted: ${id}`);
      return trainingProgram;
    } catch (error) {
      logger.error(`Error deleting training program ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`training_programs:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
    const enrollmentKeys = await redisClient.getClient().keys(`training_enrollments:${companyId}:*`);
    if (enrollmentKeys.length) await redisClient.getClient().del(enrollmentKeys);
  }
}