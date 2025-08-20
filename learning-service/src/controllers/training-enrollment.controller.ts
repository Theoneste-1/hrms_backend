// src/controllers/training-enrollment.controller.ts
import { TrainingEnrollmentService } from '../services/training-enrollment.service';
import { Request, Response, NextFunction } from 'express';
import { CreateTrainingEnrollmentDto, UpdateTrainingEnrollmentDto, TrainingEnrollmentQueryDto } from '../dto/training-enrollment.dto';

const service = new TrainingEnrollmentService();

export class TrainingEnrollmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreateTrainingEnrollmentDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const trainingEnrollment = await service.create(req.body);
      res.status(201).json(trainingEnrollment);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = TrainingEnrollmentQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const trainingEnrollments = await service.findAll(req.query);
      res.json(trainingEnrollments);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const trainingEnrollment = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(trainingEnrollment);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdateTrainingEnrollmentDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const trainingEnrollment = await service.update(req.params.id, req.body);
      res.json(trainingEnrollment);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const trainingEnrollment = await service.remove(req.params.id, req.query.companyId as string);
      res.json(trainingEnrollment);
    } catch (err) {
      next(err);
    }
  }
}