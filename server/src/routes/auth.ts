import { Router, Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { User } from '../models/User';
import { encrypt } from '../utils/crypto';
import { JWTUtils } from '../utils/jwt';
import { logger } from '../utils/logger';
import { AuthenticationError, ValidationError } from '../utils/errors';

const router = Router();

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