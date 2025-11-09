import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User, IUser } from '../models/User';
import { encrypt } from '../utils/crypto';
import { logger } from '../utils/logger';

// Configure GitHub OAuth strategy
passport.use(new GitHubStrategy({
  clientID: process.env['GITHUB_CLIENT_ID']!,
  clientSecret: process.env['GITHUB_CLIENT_SECRET']!,
  callbackURL: process.env['GITHUB_CALLBACK_URL']!,
  scope: ['repo', 'user:email']
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    logger.info('GitHub OAuth callback received', { 
      profileId: profile.id, 
      username: profile.username 
    });

    // The access token will be handled in the route handler
    // We just pass the profile and token through
    return done(null, { profile, accessToken });
  } catch (error) {
    logger.error('GitHub OAuth strategy error', { error: error instanceof Error ? error.message : error });
    return done(error, null);
  }
}));

// Serialize user for session (not used in JWT setup, but required by passport)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from session (not used in JWT setup, but required by passport)
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;