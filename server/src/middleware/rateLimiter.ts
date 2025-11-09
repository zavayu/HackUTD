import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from './auth';

/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator function
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

/**
 * Rate limit store interface for tracking requests
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory rate limiter middleware
 * Tracks request counts per user per time window
 * Returns 429 error when limit exceeded
 */
export class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: this.defaultKeyGenerator,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    };

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Default key generator using user ID or IP address
   */
  private defaultKeyGenerator = (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.userId || req.ip || 'anonymous';
  };

  /**
   * Clean up expired entries from the store
   */
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key] && this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  /**
   * Get the middleware function
   */
  public middleware(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.config.keyGenerator!(req);
      const now = Date.now();

      // Initialize or get existing entry
      if (!this.store[key] || this.store[key].resetTime <= now) {
        this.store[key] = {
          count: 0,
          resetTime: now + this.config.windowMs,
        };
      }

      const entry = this.store[key];

      // Check if limit exceeded
      if (entry.count >= this.config.maxRequests) {
        const resetTimeSeconds = Math.ceil((entry.resetTime - now) / 1000);
        
        res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later',
            correlationId: this.generateCorrelationId(),
            retryAfter: resetTimeSeconds,
          },
        });
        return;
      }

      // Increment counter
      entry.count++;

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.config.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - entry.count).toString(),
        'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString(),
      });

      // Handle response counting based on configuration
      if (!this.config.skipSuccessfulRequests || !this.config.skipFailedRequests) {
        const originalSend = res.send;
        const self = this;
        res.send = function (body: any) {
          const statusCode = res.statusCode;
          const isSuccess = statusCode >= 200 && statusCode < 400;
          const isFailed = statusCode >= 400;

          // Decrement counter if we should skip this type of request
          if (
            (isSuccess && self.config.skipSuccessfulRequests) ||
            (isFailed && self.config.skipFailedRequests)
          ) {
            entry.count = Math.max(0, entry.count - 1);
          }

          return originalSend.call(this, body);
        };
      }

      next();
    };
  }

  /**
   * Generate a correlation ID for error tracking
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset rate limit for a specific key
   */
  public reset(key: string): void {
    delete this.store[key];
  }

  /**
   * Get current count for a specific key
   */
  public getCount(key: string): number {
    const entry = this.store[key];
    if (!entry || entry.resetTime <= Date.now()) {
      return 0;
    }
    return entry.count;
  }
}

/**
 * Pre-configured rate limiters for different endpoint types
 */
export class RateLimiters {
  /**
   * Standard rate limiter (100 requests per minute)
   */
  static standard(): RequestHandler {
    const limiter = new RateLimiter({
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute
      maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    });
    return limiter.middleware();
  }

  /**
   * AI endpoints rate limiter (10 requests per minute)
   */
  static ai(): RequestHandler {
    const limiter = new RateLimiter({
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute
      maxRequests: parseInt(process.env['RATE_LIMIT_AI_MAX_REQUESTS'] || '10'),
    });
    return limiter.middleware();
  }

  /**
   * Sync endpoints rate limiter (5 requests per minute)
   */
  static sync(): RequestHandler {
    const limiter = new RateLimiter({
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute
      maxRequests: parseInt(process.env['RATE_LIMIT_SYNC_MAX_REQUESTS'] || '5'),
    });
    return limiter.middleware();
  }

  /**
   * Auth endpoints rate limiter (20 requests per minute)
   */
  static auth(): RequestHandler {
    const limiter = new RateLimiter({
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute
      maxRequests: 20, // More restrictive for auth endpoints
      keyGenerator: (req: Request) => req.ip || 'anonymous', // Use IP for auth endpoints
    });
    return limiter.middleware();
  }
}