// src/routes/department.routes.ts
import express from 'express';
import type{ Router } from 'express';
import { DepartmentController } from '../controllers/department.controller.js';

const router:Router = express.Router();
const controller = new DepartmentController();

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Department created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments with filters
 *     tags: [Departments]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
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
 *         description: Department details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
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
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Department updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
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
 *         description: Department deleted
 */
router.delete('/:id', controller.remove);

export default router;