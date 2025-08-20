// src/services/leave-request.service.ts
import { prismaClient } from '../prismaClient';
import { redisClient } from '../redisClient';
import { logger } from '../logger';

export class LeaveRequestService {
  // Note: Assuming user type check is done in middleware or controller, e.g., only employees can create, managers approve.

  async create(data: any) {
    try {
      const leaveRequest = await prismaClient.getClient().leaveRequest.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Leave request created: ${leaveRequest.id}`);
      return leaveRequest;
    } catch (error) {
      logger.error('Error creating leave request:', error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, employeeId, status, startDateFrom, startDateTo, page, limit } = query;
    const cacheKey = `leave_requests:${companyId}:${employeeId || 'all'}:${status || 'all'}:${startDateFrom || 'all'}:${startDateTo || 'all'}:page${page}:limit${limit}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      const where = { companyId };
      if (employeeId) where.employeeId = employeeId;
      if (status) where.status = status;
      if (startDateFrom || startDateTo) {
        where.startDate = {};
        if (startDateFrom) where.startDate.gte = new Date(startDateFrom);
        if (startDateTo) where.startDate.lte = new Date(startDateTo);
      }

      const leaveRequests = await prismaClient.getClient().leaveRequest.findMany({
        where,
        skip,
        take: limit,
        include: { employee: true, approvedBy: true },
        orderBy: { startDate: 'desc' },
      });

      await redisClient.set(cacheKey, JSON.stringify(leaveRequests), 3600);
      return leaveRequests;
    } catch (error) {
      logger.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `leave_request:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const leaveRequest = await prismaClient.getClient().leaveRequest.findUnique({
        where: { id, companyId },
        include: { employee: true, approvedBy: true },
      });

      if (!leaveRequest) throw new Error('Leave request not found');

      await redisClient.set(cacheKey, JSON.stringify(leaveRequest), 3600);
      return leaveRequest;
    } catch (error) {
      logger.error(`Error fetching leave request ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const leaveRequest = await prismaClient.getClient().leaveRequest.update({
        where: { id },
        data,
      });
      await this.invalidateCache(leaveRequest.companyId);
      logger.info(`Leave request updated: ${id}`);
      return leaveRequest;
    } catch (error) {
      logger.error(`Error updating leave request ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const leaveRequest = await prismaClient.getClient().leaveRequest.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Leave request deleted: ${id}`);
      return leaveRequest;
    } catch (error) {
      logger.error(`Error deleting leave request ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient.getClient().keys(`leave_requests:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}