// src/controllers/time-record.controller.ts
import { TimeRecordService } from '../services/time-record.service';
import { Request, Response, NextFunction } from 'express';
import { CreateTimeRecordDto, UpdateTimeRecordDto, TimeRecordQueryDto } from '../dto/time-record.dto';

const service = new TimeRecordService();

export class TimeRecordController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreateTimeRecordDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const timeRecord = await service.create(req.body);
      res.status(201).json(timeRecord);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = TimeRecordQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const timeRecords = await service.findAll(req.query);
      res.json(timeRecords);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const timeRecord = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(timeRecord);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdateTimeRecordDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const timeRecord = await service.update(req.params.id, req.body);
      res.json(timeRecord);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const timeRecord = await service.remove(req.params.id, req.query.companyId as string);
      res.json(timeRecord);
    } catch (err) {
      next(err);
    }
  }
}