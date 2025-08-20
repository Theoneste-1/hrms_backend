// src/services/employee.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class EmployeeService {
  async create(data: any) {
    try {
      const employee = await prismaClient.getClient().employee.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Employee created: ${employee.id}`);
      return employee;
    } catch (error) {
      logger.error('Error creating employee:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, departmentId, positionId, managerId, employmentStatus, page, limit } = query;
    const cacheKey = `employees:${companyId}:${departmentId || 'all'}:${positionId || 'all'}:${managerId || 'all'}:${employmentStatus || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (departmentId) where.departmentId = departmentId;
      if (positionId) where.positionId = positionId;
      if (managerId) where.managerId = managerId;
      if (employmentStatus) where.employmentStatus = employmentStatus;

      const employees = await prismaClient.getClient().employee.findMany({
        where,
        skip,
        take: limit,
        include: { department: true, position: true, manager: true },
      });

      await redisClient.set(cacheKey, JSON.stringify(employees), 3600); // Cache for 1 hour
      logger.info(`Employees fetched: ${employees.length}`);
      return employees;
    } catch (error) {
      logger.error('Error fetching employees:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `employee:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }

      const employee = await prismaClient.getClient().employee.findUnique({
        where: { id, companyId },
        include: { department: true, position: true, manager: true, directReports: true },
      });

      if (!employee) throw new Error('Employee not found');

      await redisClient.set(cacheKey, JSON.stringify(employee), 3600);
      logger.info(`Employee fetched: ${id}`);
      return employee;
    } catch (error) {
      logger.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const employee = await prismaClient.getClient().employee.update({
        where: { id },
        data,
      });
      await this.invalidateCache(data.companyId || employee.companyId);
      logger.info(`Employee updated: ${id}`);
      return employee;
    } catch (error) {
      logger.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const employee = await prismaClient.getClient().employee.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Employee deleted: ${id}`);
      return employee;
    } catch (error) {
      logger.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  }

  async getAnalytics(companyId: string) {
    try {
      const cacheKey = `employee_analytics:${companyId}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const total = await prismaClient.getClient().employee.count({ where: { companyId } });
      const byStatus = await prismaClient.getClient().employee.groupBy({
        by: ['employmentStatus'],
        _count: true,
        where: { companyId },
      });
      const byDepartment = await prismaClient.getClient().employee.groupBy({
        by: ['departmentId'],
        _count: true,
        where: { companyId },
      });

      const analytics = { total, byStatus, byDepartment };
      await redisClient.set(cacheKey, JSON.stringify(analytics), 3600);
      logger.info(`Employee analytics fetched for company ${companyId}`);
      return analytics;
    } catch (error) {
      logger.error(`Error fetching employee analytics for ${companyId}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`employees:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
    await redisClient.del(`employee_analytics:${companyId}`);
    logger.info(`Cache invalidated for company ${companyId}`);
  }
}