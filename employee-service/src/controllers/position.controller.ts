// src/controllers/position.controller.ts
import { PositionService } from '../services/position.service';
import { Request, Response, NextFunction } from 'express';
import { CreatePositionDto, UpdatePositionDto, PositionQueryDto } from '../dto/position.dto';

const service = new PositionService();

export class PositionController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreatePositionDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const position = await service.create(req.body);
      res.status(201).json(position);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = PositionQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const positions = await service.findAll(req.query);
      res.json(positions);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const position = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(position);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdatePositionDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const position = await service.update(req.params.id, req.body);
      res.json(position);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const position = await service.remove(req.params.id, req.query.companyId as string);
      res.json(position);
    } catch (err) {
      next(err);
    }
  }
}