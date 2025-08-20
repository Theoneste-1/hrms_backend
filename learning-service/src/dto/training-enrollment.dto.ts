// src/dto/training-enrollment.dto.ts
import * as Joi from 'joi';

export const CreateTrainingEnrollmentDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().required(),
  trainingProgramId: Joi.string().uuid().required(),
  enrollmentDate: Joi.date().required(),
  completionDeadline: Joi.date().optional(),
  progressPercentage: Joi.number().precision(2).default(0),
  currentModule: Joi.string().max(100).optional(),
  finalScore: Joi.number().precision(2).optional(),
  certificationEarned: Joi.boolean().default(false),
  certificateUrl: Joi.string().max(500).optional(),
  status: Joi.string().max(50).default('enrolled'),
});

export const UpdateTrainingEnrollmentDto = Joi.object({
  progressPercentage: Joi.number().precision(2).optional(),
  currentModule: Joi.string().max(100).optional(),
  finalScore: Joi.number().precision(2).optional(),
  certificationEarned: Joi.boolean().optional(),
  certificateUrl: Joi.string().max(500).optional(),
  status: Joi.string().max(50).optional(),
  completedAt: Joi.date().optional(),
});

export const TrainingEnrollmentQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().optional(),
  trainingProgramId: Joi.string().uuid().optional(),
  status: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});