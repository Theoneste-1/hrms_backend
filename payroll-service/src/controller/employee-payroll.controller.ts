// src/controllers/employee-payroll.controller.ts
import { EmployeePayrollService } from '../services/employee-payroll.service';
import { Request, Response, NextFunction } from 'express';
import { CreateEmployeePayrollDto, UpdateEmployeePayrollDto, EmployeePayrollQueryDto } from '../dto/employee-payroll.dto';

const service = new EmployeePayrollService();

export class EmployeePayrollController {
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreateEmployeePayrollDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const employeePayroll = await service.create(req.body);
      res.status(201).json(employeePayroll);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = EmployeePayrollQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const employeePayrolls = await service.findAll(req.query);
      res.json(employeePayrolls);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const employeePayroll = await service.findOne(req.params.id, req.query.companyId as string);
      res.json(employeePayroll);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdateEmployeePayrollDto.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const employeePayroll = await service.update(req.params.id, req.body);
      res.json(employeePayroll);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const employeePayroll = await service.remove(req.params.id, req.query.companyId as string);
      res.json(employeePayroll);
    } catch (err) {
      next(err);
    }
  }
}