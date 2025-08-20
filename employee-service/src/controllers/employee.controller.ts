// src/controllers/employee.controller.ts
import { EmployeeService } from '../services/employee.service.js';
import { Request, Response, NextFunction } from 'express';
// import * as Joi from 'joi';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto/employee.dto.js';
import { logger } from '../config/logger.js';

const service = new EmployeeService();

export class EmployeeController {
  private logger:any = logger.child({ service: 'EmployeeController' });
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = CreateEmployeeDto.validate(req.body);
      if (error) return res.status(400).json({ error: error.details?.[0]?.message });

      const employee = await service.create(req.body);

      res.status(201).json(employee);
      this.logger.info(`Employee created: ${employee.id}`);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = EmployeeQueryDto.validate(req.query);
      if (error) return res.status(400).json({ error: error.details?.[0]?.message });

      const employees = await service.findAll(req.query);
      res.json(employees);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
       const id = req.params['id'];
      if(!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      const employee = await service.findOne(id, req.query['companyId'] as string);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = UpdateEmployeeDto.validate(req.body);
      if (error) return res.status(400).json({ error: error.details?.[0]?.message });

       const id = req.params['id'];
      if(!id) {
        return res.status(400).json({ error: 'id is required' });
        
      }
      const employee = await service.update(id, req.body);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
       const id = req.params['id'];
      if(!id) {
        return res.status(400).json({ error: 'id is required' });
        
      }
      const employee = await service.remove(id, req.query['companyId'] as string);
      res.json(employee);
    } catch (err) {
      next(err);
    }
  }

  async analytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await service.getAnalytics(req.query['companyId'] as string);
      res.json(analytics);
    } catch (err) {
      next(err);
    }
  }
}