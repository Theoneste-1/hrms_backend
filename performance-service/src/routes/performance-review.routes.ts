// src/routes/performance-review.routes.ts
import express from 'express';
import { PerformanceReviewController } from '../controllers/performance-review.controller';

const router = express.Router();
const controller = new PerformanceReviewController();

/**
 * @swagger
 * /performance-reviews:
 *   post:
 *     summary: Create a new performance review
 *     tags: [PerformanceReviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               employeeId: { type: string }
 *               reviewerId: { type: string }
 *               reviewPeriod: { type: string }
 *               reviewType: { type: string }
 *               reviewDate: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Performance review created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /performance-reviews:
 *   get:
 *     summary: Get all performance reviews with filters
 *     tags: [PerformanceReviews]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of performance reviews
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /performance-reviews/{id}:
 *   get:
 *     summary: Get performance review by ID
 *     tags: [PerformanceReviews]
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
 *         description: Performance review details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /performance-reviews/{id}:
 *   put:
 *     summary: Update performance review
 *     tags: [PerformanceReviews]
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
 *               overallRating: { type: number }
 *     responses:
 *       200:
 *         description: Performance review updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /performance-reviews/{id}:
 *   delete:
 *     summary: Delete performance review
 *     tags: [PerformanceReviews]
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
 *         description: Performance review deleted
 */
router.delete('/:id', controller.remove);

export default router;