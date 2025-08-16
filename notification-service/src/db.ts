import { PrismaClient } from '@prisma/client';
import { logger } from './config/logger.js';

export const prisma = new PrismaClient();

// Connect to the database
export const connectDB = async () => {
	try {
		await prisma.$connect();
		logger.info('Connected to the database');
	} catch (error) {
		logger.error('Database connection error:', error);
		process.exit(1);
	}
};

// Disconnect from the database
export const disconnectDB = async () => {
	try {
		await prisma.$disconnect();
		logger.info('Disconnected from the database');
	} catch (error) {
		logger.error('Database disconnection error:', error);
	}
};
