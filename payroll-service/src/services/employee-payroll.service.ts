// src/services/employee-payroll.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class EmployeePayrollService {
  async create(data: any) {
    try {
      const employeePayroll = await prismaClient.getClient().employeePayroll.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Employee payroll created: ${employeePayroll.id}`);
      return employeePayroll;
    } catch (error) {
      logger.error('Error creating employee payroll:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, employeeId, payrollPeriodId, status, page, limit } = query;
    const cacheKey = `employee_payrolls:${companyId}:${employeeId || 'all'}:${payrollPeriodId || 'all'}:${status || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (employeeId) where.employeeId = employeeId;
      if (payrollPeriodId) where.payrollPeriodId = payrollPeriodId;
      if (status) where.status = status;

      const employeePayrolls = await prismaClient.getClient().employeePayroll.findMany({
        where,
        skip,
        take: limit,
        include: { employee: true, payrollPeriod: true },
      });

      await redisClient.set(cacheKey, JSON.stringify(employeePayrolls), 3600);
      return employeePayrolls;
    } catch (error) {
      logger.error('Error fetching employee payrolls:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `employee_payroll:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const employeePayroll = await prismaClient.getClient().employeePayroll.findUnique({
        where: { id, companyId },
        include: { employee: true, payrollPeriod: true },
      });

      if (!employeePayroll) throw new Error('Employee payroll not found');

      await redisClient.set(cacheKey, JSON.stringify(employeePayroll), 3600);
      return employeePayroll;
    } catch (error) {
      logger.error(`Error fetching employee payroll ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const employeePayroll = await prismaClient.getClient().employeePayroll.update({
        where: { id },
        data,
      });
      await this.invalidateCache(employeePayroll.companyId);
      logger.info(`Employee payroll updated: ${id}`);
      return employeePayroll;
    } catch (error) {
      logger.error(`Error updating employee payroll ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const employeePayroll = await prismaClient.getClient().employeePayroll.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Employee payroll deleted: ${id}`);
      return employeePayroll;
    } catch (error) {
      logger.error(`Error deleting employee payroll ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`employee_payrolls:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}