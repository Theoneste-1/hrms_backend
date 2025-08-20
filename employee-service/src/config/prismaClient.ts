import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

class PrismaService {
  private client: PrismaClient;
  private isConnected: boolean = false;

  constructor() {
    this.client = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Query logging
    this.client.$on('query', (e) => {
      logger.debug(`Query: ${e.query}`);
      logger.debug(`Params: ${e.params}`);
      logger.debug(`Duration: ${e.duration}ms`);
    });

    // Error logging
    this.client.$on('error', (e) => {
      logger.error('Prisma error:', e);
      this.isConnected = false;
    });

    // Info logging
    this.client.$on('info', (e) => {
      logger.info('Prisma info:', e);
    });

    // Warning logging
    this.client.$on('warn', (e) => {
      logger.warn('Prisma warning:', e);
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.isConnected = true;
      logger.info('Prisma client connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      this.isConnected = false;
      logger.info('Prisma client disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database:', error);
    }
  }

  getClient(): PrismaClient {
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Transaction wrapper with error handling
  async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number }
  ): Promise<T> {
    try {
      return await this.client.$transaction(fn, options);
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  // Raw query wrapper with error handling
  async rawQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
    try {
      return await this.client.$queryRawUnsafe(query, ...(params || []));
    } catch (error) {
      logger.error('Raw query failed:', error);
      throw error;
    }
  }

  // Execute raw command
  async executeRaw(command: string): Promise<number> {
    try {
      return await this.client.$executeRawUnsafe(command);
    } catch (error) {
      logger.error('Raw command execution failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const prismaClient = new PrismaService();

// Initialize connection
prismaClient.connect().catch((error) => {
  logger.error('Failed to initialize Prisma connection:', error);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prismaClient.disconnect();
});

export default prismaClient;
