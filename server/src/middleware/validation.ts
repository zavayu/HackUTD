import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware factory for request validation using Joi
 */
export class ValidationMiddleware {
  /**
   * Validate request body against a Joi schema
   * @param schema - Joi schema to validate against
   * @returns Express middleware function
   */
  static validateBody(schema: Joi.Schema): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { error, value } = schema.validate(req.body, {
          abortEarly: false, // Return all validation errors
          stripUnknown: true, // Remove unknown properties
          convert: true, // Convert values to correct types
        });

        if (error) {
          const details = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
          }));

          throw new ValidationError('Request body validation failed', details);
        }

        // Replace request body with sanitized and converted values
        req.body = value;
        next();
      } catch (err) {
        ValidationMiddleware.handleValidationError(err, res);
      }
    };
  }

  /**
   * Validate request parameters against a Joi schema
   * @param schema - Joi schema to validate against
   * @returns Express middleware function
   */
  static validateParams(schema: Joi.Schema): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { error, value } = schema.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });

        if (error) {
          const details = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
          }));

          throw new ValidationError('Request parameters validation failed', details);
        }

        // Replace request params with sanitized and converted values
        req.params = value;
        next();
      } catch (err) {
        ValidationMiddleware.handleValidationError(err, res);
      }
    };
  }

  /**
   * Validate request query parameters against a Joi schema
   * @param schema - Joi schema to validate against
   * @returns Express middleware function
   */
  static validateQuery(schema: Joi.Schema): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { error, value } = schema.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
          convert: true,
        });

        if (error) {
          const details = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
          }));

          throw new ValidationError('Request query validation failed', details);
        }

        // Replace request query with sanitized and converted values
        req.query = value;
        next();
      } catch (err) {
        ValidationMiddleware.handleValidationError(err, res);
      }
    };
  }

  /**
   * Handle validation errors and send appropriate response
   * @param error - The validation error
   * @param res - Express response object
   */
  private static handleValidationError(error: any, res: Response): void {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
          correlationId: ValidationMiddleware.generateCorrelationId(),
          details: error.details,
        },
      });
    } else {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          correlationId: ValidationMiddleware.generateCorrelationId(),
        },
      });
    }
  }

  /**
   * Generate a correlation ID for error tracking
   */
  private static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Common Joi schemas for input sanitization and validation
 */
export const CommonSchemas = {
  /**
   * MongoDB ObjectId validation
   */
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('Invalid ObjectId format'),

  /**
   * Email validation with sanitization
   */
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(255),

  /**
   * Password validation
   */
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .message('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  /**
   * String with length limits and sanitization
   */
  safeString: (min: number = 1, max: number = 255) =>
    Joi.string()
      .trim()
      .min(min)
      .max(max)
      .pattern(/^[^<>{}]*$/) // Prevent basic XSS attempts
      .message('String contains invalid characters'),

  /**
   * Pagination parameters
   */
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  /**
   * Date validation
   */
  date: Joi.date().iso(),

  /**
   * URL validation
   */
  url: Joi.string().uri(),
};

// Export convenience functions
export const validateBody = ValidationMiddleware.validateBody;
export const validateParams = ValidationMiddleware.validateParams;
export const validateQuery = ValidationMiddleware.validateQuery;