// src/dto/performance-review.dto.ts
import * as Joi from 'joi';

export const CreatePerformanceReviewDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().required(),
  reviewerId: Joi.string().uuid().required(),
  reviewPeriod: Joi.string().max(100).required(),
  reviewType: Joi.string().max(50).required(),
  reviewDate: Joi.date().required(),
  overallRating: Joi.number().precision(1).optional(),
  technicalSkills: Joi.number().precision(1).optional(),
  communicationSkills: Joi.number().precision(1).optional(),
  leadershipSkills: Joi.number().precision(1).optional(),
  teamwork: Joi.number().precision(1).optional(),
  initiative: Joi.number().precision(1).optional(),
  strengths: Joi.string().optional(),
  areasForImprovement: Joi.string().optional(),
  goals: Joi.string().optional(),
  actionPlan: Joi.string().optional(),
  status: Joi.string().max(50).default('draft'),
});

export const UpdatePerformanceReviewDto = Joi.object({
  overallRating: Joi.number().precision(1).optional(),
  technicalSkills: Joi.number().precision(1).optional(),
  communicationSkills: Joi.number().precision(1).optional(),
  leadershipSkills: Joi.number().precision(1).optional(),
  teamwork: Joi.number().precision(1).optional(),
  initiative: Joi.number().precision(1).optional(),
  strengths: Joi.string().optional(),
  areasForImprovement: Joi.string().optional(),
  goals: Joi.string().optional(),
  actionPlan: Joi.string().optional(),
  status: Joi.string().max(50).optional(),
  submittedAt: Joi.date().optional(),
  completedAt: Joi.date().optional(),
});

export const PerformanceReviewQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().optional(),
  reviewerId: Joi.string().uuid().optional(),
  status: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});