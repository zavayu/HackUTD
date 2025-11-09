import jwt from 'jsonwebtoken';

/**
 * JWT token payload interface
 */
export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * JWT utility class for token generation and verification
 */
export class JWTUtils {
  private static readonly JWT_SECRET = process.env['JWT_SECRET'];


  /**
   * Generate a JWT token for a user
   * @param userId - The user ID to include in the token
   * @returns The generated JWT token
   * @throws Error if JWT_SECRET is not configured
   */
  static generateToken(userId: string): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }

    const payload = {
      userId,
    };

    return jwt.sign(payload, this.JWT_SECRET!, { expiresIn: '24h' });
  }

  /**
   * Verify and decode a JWT token
   * @param token - The JWT token to verify
   * @returns The decoded token payload
   * @throws Error if token is invalid, expired, or JWT_SECRET is not configured
   */
  static verifyToken(token: string): TokenPayload {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not configured');
    }

    try {
      const decoded = jwt.verify(token, this.JWT_SECRET!) as TokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else if (error instanceof jwt.NotBeforeError) {
        throw new Error('Token not active yet');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   * @param authHeader - The Authorization header value
   * @returns The extracted token or null if not found
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] || null;
  }
}