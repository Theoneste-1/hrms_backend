// src/controllers/payroll-period.controller.ts
import { PayrollPeriodService } from '../services/payroll-period.service';
import { Request, Response, NextFunction } from 'express';
import { CreatePayrollPeriodDto, UpdatePayrollPeriodDto, PayrollPeriodQueryDto } from '../dto/payroll-period.dto';

const service = new PayrollPeriodService();

export class PayrollPeriodController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreatePayrollPeriodDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const payrollPeriod = await service.create(req.body);
      res.status(201).json(payrollPeriod);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = PayrollPeriodQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const payrollPeriods = await service.findAll(req.query);
      res.json(payrollPeriods);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const payrollPeriod = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(payrollPeriod);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdatePayrollPeriodDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const payrollPeriod = await service.update(req.params.id, req.body);
      res.json(payrollPeriod);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const payrollPeriod = await service.remove(req.params.id, req.query.companyId as string);
      res.json(payrollPeriod);
    } catch (err) {
      next(err);
    }
  }
}