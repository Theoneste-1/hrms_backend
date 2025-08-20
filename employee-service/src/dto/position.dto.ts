// src/dto/position.dto.ts
import * as Joi from 'joi';

export const CreatePositionDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  title: Joi.string().max(100).required(),
  description: Joi.string().optional(),
  departmentId: Joi.string().uuid().optional(),
  level: Joi.number().integer().default(1),
  minSalary: Joi.number().precision(2).optional(),
  maxSalary: Joi.number().precision(2).optional(),
  requirements: Joi.object().optional(),
  responsibilities: Joi.object().optional(),
});

export const UpdatePositionDto = Joi.object({
  title: Joi.string().max(100).optional(),
  description: Joi.string().optional(),
  departmentId: Joi.string().uuid().optional(),
  level: Joi.number().integer().optional(),
  minSalary: Joi.number().precision(2).optional(),
  maxSalary: Joi.number().precision(2).optional(),
  requirements: Joi.object().optional(),
  responsibilities: Joi.object().optional(),
});

export const PositionQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  departmentId: Joi.string().uuid().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});