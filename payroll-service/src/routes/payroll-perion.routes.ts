// src/routes/payroll-period.routes.ts
import express from 'express';
import { PayrollPeriodController } from '../controllers/payroll-period.controller';

const router = express.Router();
const controller = new PayrollPeriodController();

/**
 * @swagger
 * /payroll-periods:
 *   post:
 *     summary: Create a new payroll period
 *     tags: [PayrollPeriods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               periodName: { type: string }
 *               periodStart: { type: string, format: date }
 *               periodEnd: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Payroll period created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /payroll-periods:
 *   get:
 *     summary: Get all payroll periods with filters
 *     tags: [PayrollPeriods]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of payroll periods
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /payroll-periods/{id}:
 *   get:
 *     summary: Get payroll period by ID
 *     tags: [PayrollPeriods]
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
 *         description: Payroll period details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /payroll-periods/{id}:
 *   put:
 *     summary: Update payroll period
 *     tags: [PayrollPeriods]
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
 *         description: Payroll period updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /payroll-periods/{id}:
 *   delete:
 *     summary: Delete payroll period
 *     tags: [PayrollPeriods]
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
 *         description: Payroll period deleted
 */
router.delete('/:id', controller.remove);

export default router;