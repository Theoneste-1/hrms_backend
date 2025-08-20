// src/dto/payroll-period.dto.ts
import * as Joi from 'joi';

export const CreatePayrollPeriodDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  periodName: Joi.string().max(100).required(),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().required(),
  status: Joi.string().max(50).default('draft'),
});

export const UpdatePayrollPeriodDto = Joi.object({
  periodName: Joi.string().max(100).optional(),
  periodStart: Joi.date().optional(),
  periodEnd: Joi.date().optional(),
  status: Joi.string().max(50).optional(),
  totalGrossPay: Joi.number().precision(2).optional(),
  totalDeductions: Joi.number().precision(2).optional(),
  totalTaxes: Joi.number().precision(2).optional(),
  totalNetPay: Joi.number().precision(2).optional(),
  employeeCount: Joi.number().integer().optional(),
  processedAt: Joi.date().optional(),
  paidAt: Joi.date().optional(),
});

export const PayrollPeriodQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  status: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});