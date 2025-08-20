// src/controllers/department.controller.ts
import { DepartmentService } from '../services/department.service';
import { Request, Response, NextFunction } from 'express';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentQueryDto } from '../dto/department.dto';

const service = new DepartmentService();

export class DepartmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreateDepartmentDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const department = await service.create(req.body);
      res.status(201).json(department);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = DepartmentQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const departments = await service.findAll(req.query);
      res.json(departments);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(department);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdateDepartmentDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const department = await service.update(req.params.id, req.body);
      res.json(department);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await service.remove(req.params.id, req.query.companyId as string);
      res.json(department);
    } catch (err) {
      next(err);
    }
  }
}