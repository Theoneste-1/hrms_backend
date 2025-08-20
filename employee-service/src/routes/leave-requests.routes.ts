// src/routes/leave-request.routes.ts
import express from "express";
import type { Router } from "express";
import { LeaveRequestController } from "../controllers/leave-request.controller.js";

const router: Router = express.Router();
const controller = new LeaveRequestController();

/**
 * @swagger
 * /leave-requests:
 *   post:
 *     summary: Create a new leave request
 *     tags: [LeaveRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               employeeId: { type: string }
 *               leaveType: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               totalDays: { type: number }
 *     responses:
 *       201:
 *         description: Leave request created
 */
router.post("/", controller.create);

/**
 * @swagger
 * /leave-requests:
 *   get:
 *     summary: Get all leave requests with filters
 *     tags: [LeaveRequests]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of leave requests
 */
router.get("/", controller.findAll);

/**
 * @swagger
 * /leave-requests/{id}:
 *   get:
 *     summary: Get leave request by ID
 *     tags: [LeaveRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Leave request details
 */
router.get("/:id", controller.findOne);

/**
 * @swagger
 * /leave-requests/{id}:
 *   put:
 *     summary: Update leave request (e.g., approve/reject)
 *     tags: [LeaveRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Leave request updated
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /leave-requests/{id}:
 *   delete:
 *     summary: Delete leave request
 *     tags: [LeaveRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Leave request deleted
 */
router.delete("/:id", controller.remove);

export default router;
