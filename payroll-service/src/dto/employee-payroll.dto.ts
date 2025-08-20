// src/dto/employee-payroll.dto.ts
import * as Joi from 'joi';

export const CreateEmployeePayrollDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().required(),
  payrollPeriodId: Joi.string().uuid().required(),
  baseSalary: Joi.number().precision(2).required(),
  overtimePay: Joi.number().precision(2).default(0),
  bonusPay: Joi.number().precision(2).default(0),
  commissionPay: Joi.number().precision(2).default(0),
  otherEarnings: Joi.number().precision(2).default(0),
  totalEarnings: Joi.number().precision(2).required(),
  taxWithholding: Joi.number().precision(2).default(0),
  socialSecurity: Joi.number().precision(2).default(0),
  medicare: Joi.number().precision(2).default(0),
  healthInsurance: Joi.number().precision(2).default(0),
  retirementContribution: Joi.number().precision(2).default(0),
  otherDeductions: Joi.number().precision(2).default(0),
  totalDeductions: Joi.number().precision(2).default(0),
  netPay: Joi.number().precision(2).required(),
  status: Joi.string().max(50).default('pending'),
});

export const UpdateEmployeePayrollDto = Joi.object({
  baseSalary: Joi.number().precision(2).optional(),
  overtimePay: Joi.number().precision(2).optional(),
  bonusPay: Joi.number().precision(2).optional(),
  commissionPay: Joi.number().precision(2).optional(),
  otherEarnings: Joi.number().precision(2).optional(),
  totalEarnings: Joi.number().precision(2).optional(),
  taxWithholding: Joi.number().precision(2).optional(),
  socialSecurity: Joi.number().precision(2).optional(),
  medicare: Joi.number().precision(2).optional(),
  healthInsurance: Joi.number().precision(2).optional(),
  retirementContribution: Joi.number().precision(2).optional(),
  otherDeductions: Joi.number().precision(2).optional(),
  totalDeductions: Joi.number().precision(2).optional(),
  netPay: Joi.number().precision(2).optional(),
  status: Joi.string().max(50).optional(),
  calculatedAt: Joi.date().optional(),
  approvedAt: Joi.date().optional(),
  paidAt: Joi.date().optional(),
});

export const EmployeePayrollQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().optional(),
  payrollPeriodId: Joi.string().uuid().optional(),
  status: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});