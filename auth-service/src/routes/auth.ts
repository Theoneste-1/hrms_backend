import { Router } from 'express';
import authController from '../cotrollers/authController.js';

const router = Router();

router.use('/', authController);

export default router;