// src/routes/training-program.routes.ts
import express from 'express';
import { TrainingProgramController } from '../controllers/training-program.controller';

const router = express.Router();
const controller = new TrainingProgramController();

/**
 * @swagger
 * /training-programs:
 *   post:
 *     summary: Create a new training program
 *     tags: [TrainingPrograms]
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
 *         description: Training program created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /training-programs:
 *   get:
 *     summary: Get all training programs with filters
 *     tags: [TrainingPrograms]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of training programs
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /training-programs/{id}:
 *   get:
 *     summary: Get training program by ID
 *     tags: [TrainingPrograms]
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
 *         description: Training program details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /training-programs/{id}:
 *   put:
 *     summary: Update training program
 *     tags: [TrainingPrograms]
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
 *         description: Training program updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /training-programs/{id}:
 *   delete:
 *     summary: Delete training program
 *     tags: [TrainingPrograms]
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
 *         description: Training program deleted
 */
router.delete('/:id', controller.remove);

export default router;