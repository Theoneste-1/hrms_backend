// src/dto/time-record.dto.ts
import * as Joi from 'joi';

export const CreateTimeRecordDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().required(),
  clockIn: Joi.date().required(),
  clockOut: Joi.date().optional(),
  totalHours: Joi.number().precision(2).optional(),
  clockInLocation: Joi.object().optional(),
  clockOutLocation: Joi.object().optional(),
  deviceId: Joi.string().max(100).optional(),
  deviceType: Joi.string().max(50).optional(),
  isVerified: Joi.boolean().default(false),
  verificationMethod: Joi.string().max(50).optional(),
  notes: Joi.string().optional(),
  status: Joi.string().max(50).default('active'),
  correctedById: Joi.string().uuid().optional(),
  correctionReason: Joi.string().optional(),
});

export const UpdateTimeRecordDto = Joi.object({
  clockOut: Joi.date().optional(),
  totalHours: Joi.number().precision(2).optional(),
  clockOutLocation: Joi.object().optional(),
  isVerified: Joi.boolean().optional(),
  verificationMethod: Joi.string().max(50).optional(),
  notes: Joi.string().optional(),
  status: Joi.string().max(50).optional(),
  correctedById: Joi.string().uuid().optional(),
  correctionReason: Joi.string().optional(),
});

export const TimeRecordQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().optional(),
  status: Joi.string().optional(),
  clockInFrom: Joi.date().optional(),
  clockInTo: Joi.date().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});