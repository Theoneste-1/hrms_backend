// src/services/payroll-period.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class PayrollPeriodService {
  async create(data: any) {
    try {
      const payrollPeriod = await prismaClient.getClient().payrollPeriod.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Payroll period created: ${payrollPeriod.id}`);
      return payrollPeriod;
    } catch (error) {
      logger.error('Error creating payroll period:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, status, page, limit } = query;
    const cacheKey = `payroll_periods:${companyId}:${status || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (status) where.status = status;

      const payrollPeriods = await prismaClient.getClient().payrollPeriod.findMany({
        where,
        skip,
        take: limit,
        include: { employeePayrolls: true },
      });

      await redisClient.set(cacheKey, JSON.stringify(payrollPeriods), 3600);
      return payrollPeriods;
    } catch (error) {
      logger.error('Error fetching payroll periods:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `payroll_period:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const payrollPeriod = await prismaClient.getClient().payrollPeriod.findUnique({
        where: { id, companyId },
        include: { employeePayrolls: true },
      });

      if (!payrollPeriod) throw new Error('Payroll period not found');

      await redisClient.set(cacheKey, JSON.stringify(payrollPeriod), 3600);
      return payrollPeriod;
    } catch (error) {
      logger.error(`Error fetching payroll period ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const payrollPeriod = await prismaClient.getClient().payrollPeriod.update({
        where: { id },
        data,
      });
      await this.invalidateCache(payrollPeriod.companyId);
      logger.info(`Payroll period updated: ${id}`);
      return payrollPeriod;
    } catch (error) {
      logger.error(`Error updating payroll period ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const payrollPeriod = await prismaClient.getClient().payrollPeriod.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Payroll period deleted: ${id}`);
      return payrollPeriod;
    } catch (error) {
      logger.error(`Error deleting payroll period ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`payroll_periods:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}