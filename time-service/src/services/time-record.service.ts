// src/services/time-record.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class TimeRecordService {
  async create(data: any) {
    try {
      const timeRecord = await prismaClient.getClient().timeRecord.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Time record created: ${timeRecord.id}`);
      return timeRecord;
    } catch (error) {
      logger.error('Error creating time record:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, employeeId, status, clockInFrom, clockInTo, page, limit } = query;
    const cacheKey = `time_records:${companyId}:${employeeId || 'all'}:${status || 'all'}:${clockInFrom || 'all'}:${clockInTo || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (employeeId) where.employeeId = employeeId;
      if (status) where.status = status;
      if (clockInFrom || clockInTo) {
        where.clockIn = {};
        if (clockInFrom) where.clockIn.gte = new Date(clockInFrom);
        if (clockInTo) where.clockIn.lte = new Date(clockInTo);
      }

      const timeRecords = await prismaClient.getClient().timeRecord.findMany({
        where,
        skip,
        take: limit,
        include: { employee: true, correctedBy: true },
        orderBy: { clockIn: 'desc' },
      });

      await redisClient.set(cacheKey, JSON.stringify(timeRecords), 3600);
      return timeRecords;
    } catch (error) {
      logger.error('Error fetching time records:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `time_record:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const timeRecord = await prismaClient.getClient().timeRecord.findUnique({
        where: { id, companyId },
        include: { employee: true, correctedBy: true },
      });

      if (!timeRecord) throw new Error('Time record not found');

      await redisClient.set(cacheKey, JSON.stringify(timeRecord), 3600);
      return timeRecord;
    } catch (error) {
      logger.error(`Error fetching time record ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const timeRecord = await prismaClient.getClient().timeRecord.update({
        where: { id },
        data,
      });
      await this.invalidateCache(timeRecord.companyId);
      logger.info(`Time record updated: ${id}`);
      return timeRecord;
    } catch (error) {
      logger.error(`Error updating time record ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const timeRecord = await prismaClient.getClient().timeRecord.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Time record deleted: ${id}`);
      return timeRecord;
    } catch (error) {
      logger.error(`Error deleting time record ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`time_records:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}