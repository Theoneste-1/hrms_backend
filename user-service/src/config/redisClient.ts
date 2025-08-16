import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || '0'),
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (err) => {
      logger.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error('Failed to quit Redis client:', error);
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  // Cache operations with error handling
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error(`Failed to set Redis key ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Failed to get Redis key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error(`Failed to delete Redis key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Failed to check existence of Redis key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<number> {
    try {
      return await this.client.expire(key, ttl);
    } catch (error) {
      logger.error(`Failed to set TTL for Redis key ${key}:`, error);
      throw error;
    }
  }

  // Hash operations
  async hSet(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hSet(key, field, value);
    } catch (error) {
      logger.error(`Failed to hSet Redis hash ${key}:${field}:`, error);
      throw error;
    }
  }

  async hGet(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      logger.error(`Failed to hGet Redis hash ${key}:${field}:`, error);
      throw error;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error(`Failed to hGetAll Redis hash ${key}:`, error);
      throw error;
    }
  }

  async hDel(key: string, field: string): Promise<number> {
    try {
      return await this.client.hDel(key, field);
    } catch (error) {
      logger.error(`Failed to hDel Redis hash ${key}:${field}:`, error);
      throw error;
    }
  }

  // List operations
  async lPush(key: string, value: string): Promise<number> {
    try {
      return await this.client.lPush(key, value);
    } catch (error) {
      logger.error(`Failed to lPush Redis list ${key}:`, error);
      throw error;
    }
  }

  async rPush(key: string, value: string): Promise<number> {
    try {
      return await this.client.rPush(key, value);
    } catch (error) {
      logger.error(`Failed to rPush Redis list ${key}:`, error);
      throw error;
    }
  }

  async lPop(key: string): Promise<string | null> {
    try {
      return await this.client.lPop(key);
    } catch (error) {
      logger.error(`Failed to lPop Redis list ${key}:`, error);
      throw error;
    }
  }

  async rPop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error(`Failed to rPop Redis list ${key}:`, error);
      throw error;
    }
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      logger.error(`Failed to lRange Redis list ${key}:`, error);
      throw error;
    }
  }

  // Set operations
  async sAdd(key: string, member: string): Promise<number> {
    try {
      return await this.client.sAdd(key, member);
    } catch (error) {
      logger.error(`Failed to sAdd Redis set ${key}:`, error);
      throw error;
    }
  }

  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error(`Failed to sMembers Redis set ${key}:`, error);
      throw error;
    }
  }

  async sIsMember(key: string, member: string): Promise<number> {
    try {
      return await this.client.sIsMember(key, member);
    } catch (error) {
      logger.error(`Failed to sIsMember Redis set ${key}:`, error);
      throw error;
    }
  }

  async sRem(key: string, member: string): Promise<number> {
    try {
      return await this.client.sRem(key, member);
    } catch (error) {
      logger.error(`Failed to sRem Redis set ${key}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const redisClient = new RedisClient();

// Initialize connection
redisClient.connect().catch((error) => {
  logger.error('Failed to initialize Redis connection:', error);
});
