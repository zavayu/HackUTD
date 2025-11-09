import { Request, Response, NextFunction } from 'express';
import { JWTUtils, TokenPayload } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';

/**
 * Extended Request interface to include user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    iat: number;
    exp: number;
  };
}

/**
 * Authentication middleware to verify JWT tokens
 * Extracts and validates JWT from Authorization header
 * Attaches decoded user information to request object
 * Returns 401 error for missing, invalid, or expired tokens
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  try {
    // Extract token from Authorization header
    const authHeader = authenticatedReq.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify and decode the token
    const decoded: TokenPayload = JWTUtils.verifyToken(token);

    // Attach user information to request object
    authenticatedReq.user = {
      userId: decoded.userId,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        error: {
          code: error.code,
          message: error.message,
          correlationId: generateCorrelationId(),
        },
      });
    } else {
      // Handle JWT-specific errors
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: error instanceof Error ? error.message : 'Authentication failed',
          correlationId: generateCorrelationId(),
        },
      });
    }
  }
};

/**
 * Generate a correlation ID for error tracking
 */
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}