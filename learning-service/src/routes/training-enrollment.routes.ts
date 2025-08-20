// src/routes/training-enrollment.routes.ts
import express from 'express';
import { TrainingEnrollmentController } from '../controllers/training-enrollment.controller';

const router = express.Router();
const controller = new TrainingEnrollmentController();

/**
 * @swagger
 * /training-enrollments:
 *   post:
 *     summary: Create a new training enrollment
 *     tags: [TrainingEnrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               employeeId: { type: string }
 *               trainingProgramId: { type: string }
 *               enrollmentDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Training enrollment created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /training-enrollments:
 *   get:
 *     summary: Get all training enrollments with filters
 *     tags: [TrainingEnrollments]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of training enrollments
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /training-enrollments/{id}:
 *   get:
 *     summary: Get training enrollment by ID
 *     tags: [TrainingEnrollments]
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
 *         description: Training enrollment details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /training-enrollments/{id}:
 *   put:
 *     summary: Update training enrollment
 *     tags: [TrainingEnrollments]
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
 *               progressPercentage: { type: number }
 *     responses:
 *       200:
 *         description: Training enrollment updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /training-enrollments/{id}:
 *   delete:
 *     summary: Delete training enrollment
 *     tags: [TrainingEnrollments]
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
 *         description: Training enrollment deleted
 */
router.delete('/:id', controller.remove);

export default router;