// src/controllers/employee.controller.ts
import { EmployeeService } from '../services/employee.service';
import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto/employee.dto';
import { logger } from '../logger';

const service = new EmployeeService();

export class EmployeeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = CreateEmployeeDto.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const employee = await service.create(req.body);
      res.status(201).json(employee);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = EmployeeQueryDto.validate(req.query);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const employees = await service.findAll(req.query);
      res.json(employees);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = UpdateEmployeeDto.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const employee = await service.update(req.params.id, req.body);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await service.remove(req.params.id, req.query.companyId as string);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  async analytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await service.getAnalytics(req.query.companyId as string);
      res.json(analytics);
    } catch (err) {
      next(err);
    }
  }
}