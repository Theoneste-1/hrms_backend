import { createClient, RedisClientType } from "redis";
import { logger } from "./config/logger.js";

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      logger.info("Redis client connected");
      this.isConnected = true;
    });

    this.client.on("ready", () => {
      logger.info("Redis client ready");
    });

    this.client.on("error", (err: Error) => {
      logger.error("Redis client error:", err);
      this.isConnected = false;
    });

    this.client.on("end", () => {
      logger.info("Redis client disconnected");
      this.isConnected = false;
    });

    this.client.on("reconnecting", () => {
      logger.info("Redis client reconnecting...");
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error("Failed to connect to Redis:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error("Failed to disconnect from Redis:", error);
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error("Failed to quit Redis client:", error);
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

  // List operations for notification queues
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
}

// Create and export a singleton instance
export const redisClient = new RedisClient();

// Initialize connection
redisClient.connect().catch((error) => {
  logger.error("Failed to initialize Redis connection:", error);
});

export default redisClient;
