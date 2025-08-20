// src/controllers/performance-review.controller.ts
import { PerformanceReviewService } from '../services/performance-review.service';
import { Request, Response, NextFunction } from 'express';
import { CreatePerformanceReviewDto, UpdatePerformanceReviewDto, PerformanceReviewQueryDto } from '../dto/performance-review.dto';

const service = new PerformanceReviewService();

export class PerformanceReviewController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreatePerformanceReviewDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const performanceReview = await service.create(req.body);
      res.status(201).json(performanceReview);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = PerformanceReviewQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const performanceReviews = await service.findAll(req.query);
      res.json(performanceReviews);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceReview = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(performanceReview);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdatePerformanceReviewDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const performanceReview = await service.update(req.params.id, req.body);
      res.json(performanceReview);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const performanceReview = await service.remove(req.params.id, req.query.companyId as string);
      res.json(performanceReview);
    } catch (err) {
      next(err);
    }
  }
}