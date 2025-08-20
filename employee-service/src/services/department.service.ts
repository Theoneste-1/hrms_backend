// src/services/department.service.ts
import { prismaService } from "../services/prisma.service.js";
import { redisClient } from "../config/redisClient.js";
import { logger } from "../config/logger.js";

export class DepartmentService {
  async create(data: any) {
    try {
      const department = await prismaService.department.create({ data });
      await this.invalidateCache(data.companyId);
      logger.info(`Department created: ${department.id}`);
      return department;
    } catch (error) {
      logger.error("Error creating department:", error);
      throw error;
    }
  }

  async findAll(query: any) {
    const { companyId, parentDepartmentId, page, limit } = query;
    const cacheKey = `departments:${companyId}:${
      parentDepartmentId || "all"
    }:page${page}:limit${limit}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const skip = (page - 1) * limit;
      let where;
      if (parentDepartmentId) {
        where = { companyId, parentDepartmentId };
      } else {
        where = { companyId };
      }

      const departments = await prismaService.department.findMany({
        where,
        skip,
        take: limit,
        include: {
          parentDepartment: true,
          manager: true,
          subDepartments: true,
          employees: true,
        },
      });

      await redisClient.set(cacheKey, JSON.stringify(departments), 3600);
      return departments;
    } catch (error) {
      logger.error("Error fetching departments:", error);
      throw error;
    }
  }

  async findOne(id: string, companyId: string) {
    const cacheKey = `department:${id}:${companyId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const department = await prismaService.department.findUnique({
        where: { id, companyId },
        include: {
          parentDepartment: true,
          manager: true,
          subDepartments: true,
          employees: true,
          positions: true,
        },
      });

      if (!department) throw new Error("Department not found");

      await redisClient.set(cacheKey, JSON.stringify(department), 3600);
      return department;
    } catch (error) {
      logger.error(`Error fetching department ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const department = await prismaService.department.update({
        where: { id },
        data,
      });
      await this.invalidateCache(department.companyId);
      logger.info(`Department updated: ${id}`);
      return department;
    } catch (error) {
      logger.error(`Error updating department ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, companyId: string) {
    try {
      const department = await prismaService.department.delete({
        where: { id, companyId },
      });
      await this.invalidateCache(companyId);
      logger.info(`Department deleted: ${id}`);
      return department;
    } catch (error) {
      logger.error(`Error deleting department ${id}:`, error);
      throw error;
    }
  }

  private async invalidateCache(companyId: string) {
    const keys = await redisClient
      .getClient()
      .keys(`departments:${companyId}:*`);
    if (keys.length) await redisClient.getClient().del(keys);
  }
}
