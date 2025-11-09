import axios, { AxiosResponse, AxiosError } from 'axios';
import { logger } from '../utils/logger';
import { ExternalServiceError } from '../utils/errors';
import { GitHubRepoRepository } from '../repositories/GitHubRepoRepository';

// GitHub API interfaces
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
  } | null;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: {
    login: string;
  };
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: {
    login: string;
  };
  created_at: string;
  closed_at: string | null;
}

export interface GitHubApiError {
  message: string;
  status: number;
}

export interface SyncResult {
  success: boolean;
  commitCount: number;
  prCount: number;
  issueCount: number;
  lastSyncTime: Date;
  error?: string;
}

export class GitHubService {
  private readonly baseURL = 'https://api.github.com';
  private readonly maxRetries = 3;
  private readonly initialRetryDelay = 30000; // 30 seconds
  private gitHubRepoRepository?: GitHubRepoRepository;

  constructor(gitHubRepoRepository?: GitHubRepoRepository) {
    this.gitHubRepoRepository = gitHubRepoRepository;
  }

  /**
   * Fetch commits from a repository with date filtering (last 7 days)
   * @param repoFullName - Repository full name (owner/repo)
   * @param accessToken - GitHub access token
   * @param since - Date to fetch commits since (defaults to 7 days ago)
   * @returns Array of commits
   */
  async fetchCommits(
    repoFullName: string, 
    accessToken: string, 
    since?: Date
  ): Promise<GitHubCommit[]> {
    const sinceDate = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const url = `${this.baseURL}/repos/${repoFullName}/commits`;
    
    const params = {
      since: sinceDate.toISOString(),
      per_page: 100
    };

    logger.info('Fetching GitHub commits', { 
      repo: repoFullName, 
      since: sinceDate.toISOString() 
    });

    return this.makeRequestWithRetry<GitHubCommit[]>(
      url,
      accessToken,
      { params },
      `fetch commits for ${repoFullName}`
    );
  }

  /**
   * Fetch pull requests from a repository (open and recently merged)
   * @param repoFullName - Repository full name (owner/repo)
   * @param accessToken - GitHub access token
   * @returns Array of pull requests
   */
  async fetchPullRequests(
    repoFullName: string, 
    accessToken: string
  ): Promise<GitHubPullRequest[]> {
    const url = `${this.baseURL}/repos/${repoFullName}/pulls`;
    
    logger.info('Fetching GitHub pull requests', { repo: repoFullName });

    // Fetch open PRs
    const openPRs = await this.makeRequestWithRetry<GitHubPullRequest[]>(
      url,
      accessToken,
      { 
        params: { 
          state: 'open',
          per_page: 50
        } 
      },
      `fetch open pull requests for ${repoFullName}`
    );

    // Fetch recently closed/merged PRs (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const closedPRs = await this.makeRequestWithRetry<GitHubPullRequest[]>(
      url,
      accessToken,
      { 
        params: { 
          state: 'closed',
          sort: 'updated',
          direction: 'desc',
          per_page: 50
        } 
      },
      `fetch closed pull requests for ${repoFullName}`
    );

    // Filter closed PRs to only include those updated in the last 30 days
    const recentClosedPRs = closedPRs.filter(pr => {
      const updatedAt = new Date(pr.closed_at || pr.created_at);
      return updatedAt >= thirtyDaysAgo;
    });

    return [...openPRs, ...recentClosedPRs];
  }

  /**
   * Fetch issues from a repository (open and recently closed)
   * @param repoFullName - Repository full name (owner/repo)
   * @param accessToken - GitHub access token
   * @returns Array of issues
   */
  async fetchIssues(
    repoFullName: string, 
    accessToken: string
  ): Promise<GitHubIssue[]> {
    const url = `${this.baseURL}/repos/${repoFullName}/issues`;
    
    logger.info('Fetching GitHub issues', { repo: repoFullName });

    // Fetch open issues
    const openIssues = await this.makeRequestWithRetry<GitHubIssue[]>(
      url,
      accessToken,
      { 
        params: { 
          state: 'open',
          per_page: 50
        } 
      },
      `fetch open issues for ${repoFullName}`
    );

    // Fetch recently closed issues (last 30 days)
    const closedIssues = await this.makeRequestWithRetry<GitHubIssue[]>(
      url,
      accessToken,
      { 
        params: { 
          state: 'closed',
          sort: 'updated',
          direction: 'desc',
          per_page: 50
        } 
      },
      `fetch closed issues for ${repoFullName}`
    );

    // Filter closed issues to only include those updated in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentClosedIssues = closedIssues.filter(issue => {
      const updatedAt = new Date(issue.closed_at || issue.created_at);
      return updatedAt >= thirtyDaysAgo;
    });

    return [...openIssues, ...recentClosedIssues];
  }

  /**
   * Validate repository access with the given token
   * @param repoFullName - Repository full name (owner/repo)
   * @param accessToken - GitHub access token
   * @returns Repository information if accessible
   */
  async validateRepositoryAccess(
    repoFullName: string, 
    accessToken: string
  ): Promise<{ name: string; full_name: string; private: boolean }> {
    const url = `${this.baseURL}/repos/${repoFullName}`;
    
    logger.info('Validating GitHub repository access', { repo: repoFullName });

    return this.makeRequestWithRetry<{ name: string; full_name: string; private: boolean }>(
      url,
      accessToken,
      {},
      `validate access to ${repoFullName}`
    );
  }

  /**
   * Make HTTP request with retry logic and exponential backoff
   * @param url - Request URL
   * @param accessToken - GitHub access token
   * @param config - Axios request configuration
   * @param operation - Description of the operation for logging
   * @returns Response data
   */
  private async makeRequestWithRetry<T>(
    url: string,
    accessToken: string,
    config: any = {},
    operation: string
  ): Promise<T> {
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response: AxiosResponse<T> = await axios({
          url,
          method: 'GET',
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ProdigyPM-Backend/1.0'
          },
          timeout: 10000, // 10 second timeout
          ...config
        });

        logger.info(`GitHub API request successful`, { 
          operation, 
          attempt, 
          status: response.status 
        });

        return response.data;

      } catch (error) {
        const axiosError = error as AxiosError;
        lastError = error as Error;

        // Handle 401 responses (invalid token) - don't retry
        if (axiosError.response?.status === 401) {
          logger.error('GitHub API authentication failed', { 
            operation, 
            status: 401,
            message: 'Invalid or expired access token'
          });
          throw new ExternalServiceError('GitHub', 'Authentication failed - invalid or expired access token');
        }

        // Handle 403 responses (rate limit or forbidden) - don't retry immediately
        if (axiosError.response?.status === 403) {
          const rateLimitRemaining = axiosError.response.headers['x-ratelimit-remaining'];
          const rateLimitReset = axiosError.response.headers['x-ratelimit-reset'];
          
          logger.error('GitHub API rate limit or forbidden', { 
            operation, 
            attempt,
            status: 403,
            rateLimitRemaining,
            rateLimitReset
          });

          if (attempt === this.maxRetries) {
            throw new ExternalServiceError('GitHub', 'Rate limit exceeded or access forbidden');
          }
        }

        // Handle 404 responses (not found) - don't retry
        if (axiosError.response?.status === 404) {
          logger.error('GitHub API resource not found', { 
            operation, 
            status: 404 
          });
          throw new ExternalServiceError('GitHub', 'Repository not found or access denied');
        }

        // Log the error and prepare for retry
        logger.warn(`GitHub API request failed, attempt ${attempt}/${this.maxRetries}`, {
          operation,
          attempt,
          status: axiosError.response?.status,
          message: axiosError.message
        });

        // If this was the last attempt, throw the error
        if (attempt === this.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.initialRetryDelay * Math.pow(2, attempt - 1);
        logger.info(`Retrying GitHub API request in ${delay}ms`, { operation, attempt });
        
        await this.sleep(delay);
      }
    }

    // All retries failed
    logger.error(`GitHub API request failed after ${this.maxRetries} attempts`, { 
      operation,
      error: lastError.message 
    });

    throw new ExternalServiceError('GitHub', `Failed to ${operation} after ${this.maxRetries} attempts`);
  }

  /**
   * Connect a repository and validate access
   * @param userId - User ID
   * @param repoFullName - Repository full name (owner/repo)
   * @param accessToken - GitHub access token
   * @returns Created repository record
   */
  async connectRepository(
    userId: string, 
    repoFullName: string, 
    accessToken: string
  ): Promise<any> {
    if (!this.gitHubRepoRepository) {
      throw new Error('GitHubRepoRepository not initialized');
    }

    const repo = this.gitHubRepoRepository!;

    logger.info('Connecting GitHub repository', { 
      userId, 
      repo: repoFullName 
    });

    try {
      // First validate that we can access the repository
      const repoInfo = await this.validateRepositoryAccess(repoFullName, accessToken);
      
      logger.info('Repository access validated', { 
        repo: repoFullName,
        private: repoInfo.private 
      });

      // Create the repository connection
      const repoData = {
        userId,
        fullName: repoFullName,
        accessToken,
        isActive: true,
        syncStatus: 'pending' as const
      };

      const createdRepo = await repo.create(repoData);
      
      logger.info('Repository connected successfully', { 
        repoId: createdRepo._id,
        repo: repoFullName 
      });

      return createdRepo;

    } catch (error) {
      logger.error('Failed to connect repository', { 
        userId,
        repo: repoFullName,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  /**
   * Disconnect a repository and delete its data
   * @param repoId - Repository ID
   * @returns void
   */
  async disconnectRepository(repoId: string): Promise<void> {
    if (!this.gitHubRepoRepository) {
      throw new Error('GitHubRepoRepository not initialized');
    }

    logger.info('Disconnecting GitHub repository', { repoId });

    try {
      // Get repository info for logging
      const repo = await this.gitHubRepoRepository.findById(repoId);
      if (!repo) {
        throw new ExternalServiceError('GitHub', 'Repository not found');
      }

      // Delete the repository connection
      await this.gitHubRepoRepository.delete(repoId);
      
      logger.info('Repository disconnected successfully', { 
        repoId,
        repo: repo.fullName 
      });

    } catch (error) {
      logger.error('Failed to disconnect repository', { 
        repoId,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  /**
   * Sync repository data (commits, PRs, issues)
   * @param repoId - Repository ID
   * @returns Sync result
   */
  async syncRepository(repoId: string): Promise<SyncResult> {
    if (!this.gitHubRepoRepository) {
      throw new Error('GitHubRepoRepository not initialized');
    }

    logger.info('Starting repository sync', { repoId });

    try {
      // Get repository info
      const repo = await this.gitHubRepoRepository.findById(repoId);
      if (!repo) {
        throw new ExternalServiceError('GitHub', 'Repository not found');
      }

      if (!repo.isActive) {
        throw new ExternalServiceError('GitHub', 'Repository is not active');
      }

      // Update sync status to 'syncing'
      await this.gitHubRepoRepository.update(repoId, { 
        syncStatus: 'syncing' 
      });

      // Get decrypted access token
      const accessToken = await this.gitHubRepoRepository.getDecryptedAccessToken(repoId);

      logger.info('Fetching repository data', { 
        repoId,
        repo: repo.fullName 
      });

      // Fetch data from GitHub API
      const [commits, pullRequests, issues] = await Promise.all([
        this.fetchCommits(repo.fullName, accessToken),
        this.fetchPullRequests(repo.fullName, accessToken),
        this.fetchIssues(repo.fullName, accessToken)
      ]);

      // Transform GitHub data to our format
      const transformedCommits = commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.author?.login || commit.commit.author.name,
        date: new Date(commit.commit.author.date)
      }));

      const transformedPRs = pullRequests.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: (pr.state === 'closed' && pr.merged_at ? 'merged' : pr.state) as 'open' | 'closed' | 'merged',
        author: pr.user.login,
        createdAt: new Date(pr.created_at),
        ...(pr.merged_at && { mergedAt: new Date(pr.merged_at) })
      }));

      const transformedIssues = issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user.login,
        createdAt: new Date(issue.created_at),
        ...(issue.closed_at && { closedAt: new Date(issue.closed_at) })
      }));

      // Update repository with synced data
      await this.gitHubRepoRepository.updateSyncData(repoId, {
        commits: transformedCommits,
        pullRequests: transformedPRs,
        issues: transformedIssues,
        syncStatus: 'success'
      });

      const syncResult: SyncResult = {
        success: true,
        commitCount: transformedCommits.length,
        prCount: transformedPRs.length,
        issueCount: transformedIssues.length,
        lastSyncTime: new Date()
      };

      logger.info('Repository sync completed successfully', { 
        repoId,
        repo: repo.fullName,
        ...syncResult 
      });

      return syncResult;

    } catch (error) {
      logger.error('Repository sync failed', { 
        repoId,
        error: error instanceof Error ? error.message : error 
      });

      // Update sync status to 'failed' with error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      
      try {
        await this.gitHubRepoRepository.updateSyncData(repoId, {
          syncStatus: 'failed',
          syncError: errorMessage
        });
      } catch (updateError) {
        logger.error('Failed to update sync error status', { 
          repoId,
          updateError: updateError instanceof Error ? updateError.message : updateError 
        });
      }

      return {
        success: false,
        commitCount: 0,
        prCount: 0,
        issueCount: 0,
        lastSyncTime: new Date(),
        error: errorMessage
      };
    }
  }

  /**
   * Get repository data
   * @param repoId - Repository ID
   * @returns Repository data
   */
  async getRepositoryData(repoId: string): Promise<any> {
    if (!this.gitHubRepoRepository) {
      throw new Error('GitHubRepoRepository not initialized');
    }

    logger.info('Getting repository data', { repoId });

    try {
      const repo = await this.gitHubRepoRepository.findById(repoId);
      if (!repo) {
        throw new ExternalServiceError('GitHub', 'Repository not found');
      }

      return {
        id: repo._id,
        fullName: repo.fullName,
        isActive: repo.isActive,
        lastSyncTime: repo.lastSyncTime,
        syncStatus: repo.syncStatus,
        syncError: repo.syncError,
        commits: repo.commits,
        pullRequests: repo.pullRequests,
        issues: repo.issues,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt
      };

    } catch (error) {
      logger.error('Failed to get repository data', { 
        repoId,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  /**
   * Sleep for the specified number of milliseconds
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GitHubService;