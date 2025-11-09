import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport';
import { User } from '../models/User';
import { encrypt } from '../utils/crypto';
import { JWTUtils } from '../utils/jwt';
import { logger } from '../utils/logger';
import { AuthenticationError, ValidationError } from '../utils/errors';

const router = Router();
const JWT_SECRET: string = process.env['JWT_SECRET'] || 'your-secret-key';
const JWT_EXPIRATION: string = process.env['JWT_EXPIRATION'] || '24h';

// Sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET as jwt.Secret,
      { expiresIn: JWT_EXPIRATION } as jwt.SignOptions
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: user.toJSON()
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET as jwt.Secret,
      { expiresIn: JWT_EXPIRATION } as jwt.SignOptions
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
});

// Get current user (requires token)
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON()
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
});

/**
 * Initiate GitHub OAuth flow
 * GET /api/auth/github
 */
router.get('/github', passport.authenticate('github', { 
  scope: ['repo', 'user:email'],
  session: false 
}));

/**
 * Handle GitHub OAuth callback
 * GET /api/auth/github/callback
 */
router.get('/github/callback', 
  passport.authenticate('github', { 
    session: false,
    failureRedirect: `${process.env['FRONTEND_URL']}/login?error=github_auth_failed`
  }),
  async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const { profile, accessToken } = req.user as any;

      if (!profile || !accessToken) {
        throw new AuthenticationError('GitHub authentication failed - missing profile or access token');
      }

      // Extract email from profile
      const email = profile.emails?.[0]?.value;
      if (!email) {
        throw new ValidationError('GitHub account must have a public email address', { 
          field: 'email' 
        });
      }

      logger.info('Processing GitHub OAuth callback', { 
        email, 
        githubId: profile.id,
        username: profile.username 
      });

      // Find or create user
      let user = await User.findOne({ email }).select('+githubAccessToken');
      
      if (!user) {
        // Create new user with GitHub data
        user = new User({
          email,
          name: profile.displayName || profile.username || 'GitHub User',
          password: 'github-oauth-' + Date.now(), // Temporary password, user can change later
          githubAccessToken: encrypt(accessToken)
        });
        
        await user.save();
        logger.info('Created new user from GitHub OAuth', { userId: user._id, email });
      } else {
        // Update existing user with GitHub access token
        user.githubAccessToken = encrypt(accessToken);
        await user.save();
        logger.info('Updated existing user with GitHub token', { userId: user._id, email });
      }

      // Generate JWT token
      const jwtToken = JWTUtils.generateToken((user._id as any).toString());

      // Redirect to frontend with token
      const redirectUrl = `${process.env['FRONTEND_URL']}/auth/callback?token=${jwtToken}`;
      res.redirect(redirectUrl);

    } catch (error) {
      logger.error('GitHub OAuth callback error', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });

      // Redirect to frontend with error
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      const redirectUrl = `${process.env['FRONTEND_URL']}/login?error=${encodeURIComponent(errorMessage)}`;
      res.redirect(redirectUrl);
    }
  }
);

export default router;
