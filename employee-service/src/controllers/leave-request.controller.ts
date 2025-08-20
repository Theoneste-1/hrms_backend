// src/controllers/leave-request.controller.ts
import { LeaveRequestService } from '../services/leave-request.service.js';
import { Request, Response, NextFunction } from 'express';
import { CreateLeaveRequestDto, UpdateLeaveRequestDto, LeaveRequestQueryDto } from '../dto/leave-request.dto.js';
import { AuthenticatedRequest } from '../types/authed.js';
import { logger } from '../config/logger.js';

const service = new LeaveRequestService();

export class LeaveRequestController {
  private logger: any = logger.child({ service: 'LeaveRequestController' });
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { error } = CreateLeaveRequestDto.validate(req.body);
    if (error) return res.status(400).json({ error: error?.details?.[0]?.message });
    try {
      // Assume req.user is set by auth middleware, check if employee
      if (req?.user?.role !== 'EMPLOYEE') return res.status(403).json({ error: 'Only employees can request leave' });
      const leaveRequest = await service.create(req.body);
      res.status(201).json(leaveRequest);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = LeaveRequestQueryDto.validate(req.query);
    if (error) return res.status(400).json({ error: error?.details?.[0]?.message });
    try {
      const leaveRequests = await service.findAll(req.query);
      res.json(leaveRequests);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'];
      if (!id) return res.status(400).json({ error: 'id is required' });
      const leaveRequest = await service.findOne(id, req.query['companyId'] as string);
      res.json(leaveRequest);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { error } = UpdateLeaveRequestDto.validate(req.body);
    if (error) return res.status(400).json({ error: error?.details?.[0]?.message });
    try {
      const id = req.params['id'];
      if (!id) return res.status(400).json({ error: 'id is required' });
      // For approval, check if manager
      if (req.body.status && ['approved', 'rejected'].includes(req.body.status) && req?.user?.role !== 'MANAGER') {
        return res.status(403).json({ error: 'Only managers can approve/reject leaves' });
      }
      const leaveRequest = await service.update(id, req.body);
      res.json(leaveRequest);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'];
      if (!id) return res.status(400).json({ error: 'id is required' });
      const leaveRequest = await service.remove(id, req.query['companyId'] as string);
      this.logger.info(`Leave request deleted: ${id}`);
      res.json(leaveRequest);
    } catch (err) {
      next(err);
    }
  }
}