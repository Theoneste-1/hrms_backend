// src/dto/training-program.dto.ts
import * as Joi from 'joi';

export const CreateTrainingProgramDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  name: Joi.string().max(255).required(),
  description: Joi.string().optional(),
  category: Joi.string().max(100).optional(),
  difficultyLevel: Joi.string().max(20).optional(),
  estimatedDurationHours: Joi.number().integer().optional(),
  prerequisites: Joi.object().optional(),
  learningObjectives: Joi.object().optional(),
  status: Joi.string().max(50).default('active'),
});

export const UpdateTrainingProgramDto = Joi.object({
  name: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  category: Joi.string().max(100).optional(),
  difficultyLevel: Joi.string().max(20).optional(),
  estimatedDurationHours: Joi.number().integer().optional(),
  prerequisites: Joi.object().optional(),
  learningObjectives: Joi.object().optional(),
  status: Joi.string().max(50).optional(),
});

export const TrainingProgramQueryDto = Joi.object({
  companyId: Joi.string().uuid().required(),
  status: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});