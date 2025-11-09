/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public override message: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

/**
 * Authentication error for invalid credentials or tokens
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTHENTICATION_ERROR', message);
  }
}

/**
 * Authorization error for insufficient permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

/**
 * External service error for third-party API failures
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(503, 'EXTERNAL_SERVICE_ERROR', `${service}: ${message}`);
  }
}