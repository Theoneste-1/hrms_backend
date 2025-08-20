// src/routes/time-record.routes.ts
import express from 'express';
import { TimeRecordController } from '../controllers/time-record.controller';

const router = express.Router();
const controller = new TimeRecordController();

/**
 * @swagger
 * /time-records:
 *   post:
 *     summary: Create a new time record
 *     tags: [TimeRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId: { type: string }
 *               employeeId: { type: string }
 *               clockIn: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Time record created
 */
router.post('/', controller.create);

/**
 * @swagger
 * /time-records:
 *   get:
 *     summary: Get all time records with filters
 *     tags: [TimeRecords]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of time records
 */
router.get('/', controller.findAll);

/**
 * @swagger
 * /time-records/{id}:
 *   get:
 *     summary: Get time record by ID
 *     tags: [TimeRecords]
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
 *         description: Time record details
 */
router.get('/:id', controller.findOne);

/**
 * @swagger
 * /time-records/{id}:
 *   put:
 *     summary: Update time record
 *     tags: [TimeRecords]
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
 *               clockOut: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Time record updated
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /time-records/{id}:
 *   delete:
 *     summary: Delete time record
 *     tags: [TimeRecords]
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
 *         description: Time record deleted
 */
router.delete('/:id', controller.remove);

export default router;