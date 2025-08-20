// src/controllers/position.controller.ts
import { PositionService } from "../services/position.service.js";
import { Request, Response, NextFunction } from "express";
import {
  CreatePositionDto,
  UpdatePositionDto,
  PositionQueryDto,
} from "../dto/position.dto.js";
import { logger } from "../config/logger.js";
const service = new PositionService();

export class PositionController {
  private logger = logger.child({ service: "PositionController" });
  async create(req: Request, res: Response, next: NextFunction) {
    const { error } = CreatePositionDto.validate(req.body);
    if (error)
      return res.status(400).json({ error: error?.details?.[0]?.message });
    try {
      const position = await service.create(req.body);
      res.status(201).json(position);
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    const { error } = PositionQueryDto.validate(req.query);
    if (error)
      return res.status(400).json({ error: error?.details?.[0]?.message });
    try {
      const positions = await service.findAll(req.query);
      res.json(positions);
    } catch (err) {
      next(err);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"];
      if (!id) return res.status(400).json({ error: "id is required" });
      const position = await service.findOne(
        id,
        req.query["companyId"] as string
      );
      res.json(position);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const { error } = UpdatePositionDto.validate(req.body);
    if (error)
      return res.status(400).json({ error: error?.details?.[0]?.message });
    try {
      const id = req.params["id"];
      if (!id) return res.status(400).json({ error: "id is required" });
      const position = await service.update(id, req.body);
      res.json(position);
    } catch (err) {
      next(err);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"];
      if (!id) return res.status(400).json({ error: "id is required" });
      const position = await service.remove(
        id,
        req.query["companyId"] as string
      );
      res.json(position);
      this.logger.info(`Position deleted: ${id}`);
    } catch (err) {
      next(err);
    }
  }
}
