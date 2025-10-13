const Redis = require('ioredis');
const logger = require('../utils/logger');

class RateLimiter {
  constructor() {
    this.redis = null;
    this.enabled = false;
    
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          password: process.env.REDIS_PASSWORD || undefined,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          }
        });
        
        this.redis.on('connect', () => {
          logger.info('Redis connected for rate limiting');
          this.enabled = true;
        });
        
        this.redis.on('error', (err) => {
          logger.warn('Redis error, rate limiting disabled', { error: err.message });
          this.enabled = false;
        });
      } catch (error) {
        logger.warn('Failed to initialize Redis, rate limiting disabled', {
          error: error.message
        });
      }
    } else {
      logger.warn('REDIS_URL not configured, rate limiting disabled');
    }
  }

  /**
   * Rate limit middleware
   */
  limit(options = {}) {
    const {
      windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      keyPrefix = 'ratelimit:'
    } = options;

    return async (req, res, next) => {
      if (!this.enabled) {
        return next();
      }

      try {
        const key = `${keyPrefix}${req.ip || req.connection.remoteAddress}`;
        const current = await this.redis.incr(key);
        
        if (current === 1) {
          await this.redis.expire(key, Math.floor(windowMs / 1000));
        }

        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

        if (current > maxRequests) {
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            key,
            current,
            limit: maxRequests
          });

          return res.status(429).json({
            success: false,
            error: 'Too many requests, please try again later',
            retryAfter: Math.floor(windowMs / 1000)
          });
        }

        next();
      } catch (error) {
        logger.error('Rate limiter error', { error: error.message });
        // On error, allow the request through
        next();
      }
    };
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

module.exports = rateLimiter;

