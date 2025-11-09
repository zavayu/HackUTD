import { Router, Response, NextFunction } from 'express';
import { verifyToken } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import GitHubService from '../services/GitHubService';
import { GitHubRepoRepository } from '../repositories/GitHubRepoRepository';
import { UserRepository } from '../repositories/UserRepository';
import { decrypt } from '../utils/crypto';
import { logger } from '../utils/logger';
import {
  AuthenticationError,
  NotFoundError
} from '../utils/errors';
import Joi from 'joi';

const router = Router();

// Initialize repositories and service
const gitHubRepoRepository = new GitHubRepoRepository();
const userRepository = new UserRepository();
const gitHubService = new GitHubService(gitHubRepoRepository);

// Validation schemas
const connectRepoSchema = Joi.object({
  repoFullName: Joi.string()
    .pattern(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Repository name must be in format "owner/repo"'
    })
});

const repoIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid repository ID format'
    })
});

/**
 * Get user's GitHub repositories from GitHub API
 * GET /api/github/available-repos
 */
router.get('/available-repos', verifyToken, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    logger.info('Fetching available GitHub repositories', { userId });

    // Get user's GitHub access token
    const user = await userRepository.findById(userId);
    if (!user || !user.githubAccessToken) {
      throw new AuthenticationError('GitHub access token not found. Please authenticate with GitHub first.');
    }

    // Decrypt the access token
    const accessToken = decrypt(user.githubAccessToken);

    // Fetch repositories from GitHub API
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ProdigyPM'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const repos = (await response.json()) as any[];

    // Format the response
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      language: repo.language,
      private: repo.private,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      updated_at: repo.updated_at
    }));

    res.json({
      success: true,
      data: formattedRepos
    });

  } catch (error) {
    logger.error('Failed to fetch available repositories', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : error
    });
    next(error);
  }
});

/**
 * Get user's connected repositories
 * GET /api/github/repos
 */
router.get('/repos', verifyToken, async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;

    logger.info('Getting user repositories', { userId });

    const repos = await gitHubRepoRepository.findByUserId(userId);

    res.json({
      success: true,
      data: repos
    });

  } catch (error) {
    logger.error('Failed to get user repositories', {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : error
    });
    next(error);
  }
});

/**
 * Connect a new repository
 * POST /api/github/repos/connect
 */
router.post('/repos/connect',
  verifyToken,
  validateBody(connectRepoSchema),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;
      const { repoFullName } = req.body;

      logger.info('Connecting repository', { userId, repo: repoFullName });

      // Get user's GitHub access token
      const user = await userRepository.findById(userId);
      if (!user || !user.githubAccessToken) {
        throw new AuthenticationError('GitHub access token not found. Please authenticate with GitHub first.');
      }

      // Decrypt the access token
      const accessToken = decrypt(user.githubAccessToken);

      // Connect the repository
      const repo = await gitHubService.connectRepository(userId, repoFullName, accessToken);

      res.status(201).json({
        success: true,
        message: 'Repository connected successfully',
        data: repo
      });

    } catch (error) {
      logger.error('Failed to connect repository', {
        userId: req.user?.userId,
        repo: req.body?.repoFullName,
        error: error instanceof Error ? error.message : error
      });
      next(error);
    }
  }
);

/**
 * Disconnect a repository
 * DELETE /api/github/repos/:id
 */
router.delete('/repos/:id',
  verifyToken,
  validateParams(repoIdSchema),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;
      const repoId = req.params['id']!;

      logger.info('Disconnecting repository', { userId, repoId });

      // Verify user owns the repository
      const repo = await gitHubRepoRepository.findById(repoId);
      if (!repo) {
        throw new NotFoundError('Repository');
      }

      if (repo.userId.toString() !== userId) {
        throw new AuthenticationError('Access denied - repository belongs to another user');
      }

      // Disconnect the repository
      await gitHubService.disconnectRepository(repoId);

      res.json({
        success: true,
        message: 'Repository disconnected successfully'
      });

    } catch (error) {
      logger.error('Failed to disconnect repository', {
        userId: req.user?.userId,
        repoId: req.params['id'],
        error: error instanceof Error ? error.message : error
      });
      next(error);
    }
  }
);

/**
 * Trigger manual sync for a repository
 * POST /api/github/repos/:id/sync
 */
router.post('/repos/:id/sync',
  verifyToken,
  validateParams(repoIdSchema),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;
      const repoId = req.params['id']!;

      logger.info('Triggering manual repository sync', { userId, repoId });

      // Verify user owns the repository
      const repo = await gitHubRepoRepository.findById(repoId);
      if (!repo) {
        throw new NotFoundError('Repository');
      }

      if (repo.userId.toString() !== userId) {
        throw new AuthenticationError('Access denied - repository belongs to another user');
      }

      // Trigger sync
      const syncResult = await gitHubService.syncRepository(repoId);

      res.json({
        success: true,
        message: syncResult.success ? 'Repository synced successfully' : 'Repository sync failed',
        data: syncResult
      });

    } catch (error) {
      logger.error('Failed to sync repository', {
        userId: req.user?.userId,
        repoId: req.params['id'],
        error: error instanceof Error ? error.message : error
      });
      next(error);
    }
  }
);

/**
 * Get synced repository data
 * GET /api/github/repos/:id/data
 */
router.get('/repos/:id/data',
  verifyToken,
  validateParams(repoIdSchema),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;
      const repoId = req.params['id']!;

      logger.info('Getting repository data', { userId, repoId });

      // Verify user owns the repository
      const repo = await gitHubRepoRepository.findById(repoId);
      if (!repo) {
        throw new NotFoundError('Repository');
      }

      if (repo.userId.toString() !== userId) {
        throw new AuthenticationError('Access denied - repository belongs to another user');
      }

      // Get repository data
      const repoData = await gitHubService.getRepositoryData(repoId);

      res.json({
        success: true,
        data: repoData
      });

    } catch (error) {
      logger.error('Failed to get repository data', {
        userId: req.user?.userId,
        repoId: req.params['id'],
        error: error instanceof Error ? error.message : error
      });
      next(error);
    }
  }
);

export default router;