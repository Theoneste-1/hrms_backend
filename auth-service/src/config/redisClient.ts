import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

class RedisClient {
  private client: Redis;
  private readonly redisUrl: string;

  constructor() {
    this.redisUrl = process.env["REDIS_URL"] || "redis://localhost:6379";
    this.client = new Redis(this.redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
      // password: process.env['REDIS_PASSWORD'],
      // db: parseInt(process.env['REDIS_DB'] || '0', 10),
    });

    this.client.on("connect", () => {
      console.log("Redis connected bro");
    });
    this.client.on("error", (err: Error) => {
      console.error("Redis error bro:", err);
    });
    this.client.on("ready", () => {
      console.log("Redis is ready bro");
    });
  }

  public getClient(): Redis {
    return this.client;
  }

  public async set(key: string, value: string | object, expireIn?: number): Promise<string | null> {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    if (expireIn) {
      return await this.client.set(key, stringValue, "EX", expireIn);
    } else {
      return await this.client.set(key, stringValue);
    }
  }

  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  public async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  public async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  public async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export const redisClient = new RedisClient();