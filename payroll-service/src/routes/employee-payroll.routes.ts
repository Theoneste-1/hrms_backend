// src/routes/employee-payroll.routes.ts
import express from 'express';
import { EmployeePayrollController } from '../controllers/employee-payroll.controller';

const router = express.Router();
const controller = new EmployeePayrollController();

/**
 * @swagger
 * /employee-payrolls:
 *   post:
 *     summary: Create a new employee payroll
 *     tags: [EmployeePayrolls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               employeeId: { type: string }
 *               payrollPeriodId: { type: string }
 *               baseSalary: { type: number }
 *               totalEarnings: { type: number }
 *               netPay: { type: number }
 *     responses:
 *       201:
 *         description: Employee payroll created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /employee-payrolls:
 *   get:
 *     summary: Get all employee payrolls with filters
 *     tags: [EmployeePayrolls]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of employee payrolls
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /employee-payrolls/{id}:
 *   get:
 *     summary: Get employee payroll by ID
 *     tags: [EmployeePayrolls]
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
 *         description: Employee payroll details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /employee-payrolls/{id}:
 *   put:
 *     summary: Update employee payroll
 *     tags: [EmployeePayrolls]
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
 *         description: Employee payroll updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /employee-payrolls/{id}:
 *   delete:
 *     summary: Delete employee payroll
 *     tags: [EmployeePayrolls]
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
 *         description: Employee payroll deleted
 */
router.delete('/:id', controller.remove);

export default router;