// src/dto/department.dto.ts
import * as Joi from 'joi';

export const CreateDepartmentDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  name: Joi.string().max(100).required(),
  description: Joi.string().optional(),
  parentDepartmentId: Joi.string().uuid().optional(),
  managerId: Joi.string().uuid().optional(),
  budget: Joi.number().precision(2).optional(),
  headcountLimit: Joi.number().integer().optional(),
});

export const UpdateDepartmentDto = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().optional(),
  parentDepartmentId: Joi.string().uuid().optional(),
  managerId: Joi.string().uuid().optional(),
  budget: Joi.number().precision(2).optional(),
  headcountLimit: Joi.number().integer().optional(),
});

export const DepartmentQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  parentDepartmentId: Joi.string().uuid().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});