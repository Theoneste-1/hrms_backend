// src/routes/employee.routes.ts
import express from 'express';
import type {Router} from 'express'
import { EmployeeController } from '../controllers/employee.controller.js';

const router:Router = express.Router();
const controller = new EmployeeController();

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               employeeId: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               hireDate: { type: string, format: date }
 *               employmentType: { type: string }
 *     responses:
 *       201:
 *         description: Employee created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Get all employees with filters
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
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
 *         description: Employee details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update employee
 *     tags: [Employees]
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
 *               firstName: { type: string }
 *     responses:
 *       200:
 *         description: Employee updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete employee
 *     tags: [Employees]
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
 *         description: Employee deleted
 */
router.delete('/:id', controller.remove);

/**
 * @swagger
 * /employees/analytics:
 *   get:
 *     summary: Get employee analytics
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Employee analytics
 */
router.get('/analytics', controller.analytics);

export default router;