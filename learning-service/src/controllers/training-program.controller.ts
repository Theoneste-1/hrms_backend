// src/controllers/training-program.controller.ts
import { TrainingProgramService } from '../services/training-program.service';
import { Request, Response, NextFunction } from 'express';
import { CreateTrainingProgramDto, UpdateTrainingProgramDto, TrainingProgramQueryDto } from '../dto/training-program.dto';

const service = new TrainingProgramService();

export class TrainingProgramController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreateTrainingProgramDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const trainingProgram = await service.create(req.body);
      res.status(201).json(trainingProgram);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = TrainingProgramQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const trainingPrograms = await service.findAll(req.query);
      res.json(trainingPrograms);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const trainingProgram = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(trainingProgram);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdateTrainingProgramDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const trainingProgram = await service.update(req.params.id, req.body);
      res.json(trainingProgram);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const trainingProgram = await service.remove(req.params.id, req.query.companyId as string);
      res.json(trainingProgram);
    } catch (err) {
      next(err);
    }
  }
}