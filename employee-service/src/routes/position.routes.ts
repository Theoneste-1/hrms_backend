// src/routes/position.routes.ts
import express from 'express';
import { PositionController } from '../controllers/position.controller';

const router = express.Router();
const controller = new PositionController();

/**
 * @swagger
 * /positions:
 *   post:
 *     summary: Create a new position
 *     tags: [Positions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               title: { type: string }
 *     responses:
 *       201:
 *         description: Position created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /positions:
 *   get:
 *     summary: Get all positions with filters
 *     tags: [Positions]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of positions
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /positions/{id}:
 *   get:
 *     summary: Get position by ID
 *     tags: [Positions]
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
 *         description: Position details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /positions/{id}:
 *   put:
 *     summary: Update position
 *     tags: [Positions]
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
 *               title: { type: string }
 *     responses:
 *       200:
 *         description: Position updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /positions/{id}:
 *   delete:
 *     summary: Delete position
 *     tags: [Positions]
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
 *         description: Position deleted
 */
router.delete('/:id', controller.remove);

export default router;