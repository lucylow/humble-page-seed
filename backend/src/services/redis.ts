import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class RedisService {
  private client: RedisClientType | null = null;
  private logger: Logger;
  private isConnected: boolean = false;

  constructor() {
    this.logger = new Logger('RedisService');
  }

  public async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: config.redis.url || `redis://${config.redis.host}:${config.redis.port}`
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error', { error: err });
      });

      this.client.on('connect', () => {
        this.logger.info('Redis client connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      this.logger.warn('Redis connection failed, running without cache', { error });
      this.client = null;
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error('Redis GET failed', { error, key });
      return null;
    }
  }

  public async set(key: string, value: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.set(key, value);
    } catch (error) {
      this.logger.error('Redis SET failed', { error, key });
    }
  }

  public async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.setEx(key, seconds, value);
    } catch (error) {
      this.logger.error('Redis SETEX failed', { error, key });
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error('Redis DEL failed', { error, key });
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

