// src/dto/leave-request.dto.ts
import * as Joi from 'joi';

export const CreateLeaveRequestDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().required(),
  leaveType: Joi.string().max(50).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  totalDays: Joi.number().precision(1).required(),
  reason: Joi.string().optional(),
  status: Joi.string().max(50).default('pending'),
  requestedAt: Joi.date().default(new Date()),
  leaveBalanceBefore: Joi.number().precision(1).optional(),
  leaveBalanceAfter: Joi.number().precision(1).optional(),
});

export const UpdateLeaveRequestDto = Joi.object({
  leaveType: Joi.string().max(50).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  totalDays: Joi.number().precision(1).optional(),
  reason: Joi.string().optional(),
  status: Joi.string().max(50).optional(),
  approvedById: Joi.string().uuid().optional(),
  approvedAt: Joi.date().optional(),
  rejectionReason: Joi.string().optional(),
  leaveBalanceBefore: Joi.number().precision(1).optional(),
  leaveBalanceAfter: Joi.number().precision(1).optional(),
});

export const LeaveRequestQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().optional(),
  status: Joi.string().optional(),
  startDateFrom: Joi.date().optional(),
  startDateTo: Joi.date().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});