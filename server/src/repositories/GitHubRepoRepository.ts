import { GitHubRepo, IGitHubRepo, ICommit, IPullRequest, IGitHubIssue } from '../models/GitHubRepo';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

export interface CreateGitHubRepoData {
  userId: string;
  fullName: string;
  accessToken: string;
  isActive?: boolean;
  syncStatus?: 'pending' | 'syncing' | 'success' | 'failed';
}

export interface UpdateGitHubRepoData {
  accessToken?: string;
  isActive?: boolean;
  lastSyncTime?: Date;
  syncStatus?: 'pending' | 'syncing' | 'success' | 'failed';
  syncError?: string;
  commits?: ICommit[];
  pullRequests?: IPullRequest[];
  issues?: IGitHubIssue[];
}

export class GitHubRepoRepository {
  /**
   * Create a new GitHub repository connection
   */
  async create(data: CreateGitHubRepoData): Promise<IGitHubRepo> {
    try {
      const repoData = {
        ...data,
        userId: new mongoose.Types.ObjectId(data.userId)
      };
      
      const repo = new GitHubRepo(repoData);
      return await repo.save();
    } catch (error: any) {
      // Log the actual error for debugging
      console.error('GitHubRepo creation error:', error);
      
      // Handle duplicate fullName constraint
      if (error.code === 11000 && error.keyPattern?.fullName) {
        throw new AppError(400, 'DUPLICATE_REPO', 'Repository is already connected');
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', `Repository validation failed: ${messages.join(', ')}`);
      }
      
      throw new AppError(500, 'DATABASE_ERROR', `Failed to create repository connection: ${error.message}`);
    }
  }

  /**
   * Find repository by ID
   */
  async findById(id: string): Promise<IGitHubRepo | null> {
    try {
      return await GitHubRepo.findById(id).select('+accessToken');
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find repository by ID');
    }
  }

  /**
   * Find repositories by user ID
   */
  async findByUserId(userId: string): Promise<IGitHubRepo[]> {
    try {
      return await GitHubRepo.find({ userId: new mongoose.Types.ObjectId(userId) })
        .sort({ updatedAt: -1 });
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find repositories by user ID');
    }
  }

  /**
   * Update repository by ID
   */
  async update(id: string, data: UpdateGitHubRepoData): Promise<IGitHubRepo> {
    try {
      const repo = await GitHubRepo.findByIdAndUpdate(
        id,
        { $set: data },
        { 
          new: true, 
          runValidators: true 
        }
      ).select('+accessToken');

      if (!repo) {
        throw new AppError(404, 'REPO_NOT_FOUND', 'Repository not found');
      }

      return repo;
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'Repository validation failed', messages);
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update repository');
    }
  }

  /**
   * Delete repository by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await GitHubRepo.findByIdAndDelete(id);
      
      if (!result) {
        throw new AppError(404, 'REPO_NOT_FOUND', 'Repository not found');
      }
    } catch (error: any) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete repository');
    }
  }

  /**
   * Find all active repositories (for background sync jobs)
   */
  async findAllActive(): Promise<IGitHubRepo[]> {
    try {
      return await GitHubRepo.find({ isActive: true })
        .select('+accessToken')
        .sort({ lastSyncTime: 1 }); // Sort by oldest sync first
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find active repositories');
    }
  }

  /**
   * Get decrypted access token for a repository
   */
  async getDecryptedAccessToken(id: string): Promise<string> {
    try {
      const repo = await GitHubRepo.findById(id).select('+accessToken');
      
      if (!repo) {
        throw new AppError(404, 'REPO_NOT_FOUND', 'Repository not found');
      }

      // Check if token is encrypted
      if (repo.accessToken.startsWith('encrypted:')) {
        return repo.decryptAccessToken();
      }
      
      // Return token as-is if not encrypted (for backward compatibility)
      return repo.accessToken;
    } catch (error: any) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to decrypt access token');
    }
  }

  /**
   * Update sync data for a repository
   */
  async updateSyncData(
    id: string, 
    syncData: {
      commits?: ICommit[];
      pullRequests?: IPullRequest[];
      issues?: IGitHubIssue[];
      syncStatus: 'success' | 'failed';
      syncError?: string;
    }
  ): Promise<IGitHubRepo> {
    try {
      const updateData: any = {
        lastSyncTime: new Date(),
        syncStatus: syncData.syncStatus
      };

      if (syncData.syncError) {
        updateData.syncError = syncData.syncError;
      } else {
        updateData.$unset = { syncError: 1 };
      }

      // Only update arrays if provided
      if (syncData.commits) {
        updateData.commits = syncData.commits;
      }
      if (syncData.pullRequests) {
        updateData.pullRequests = syncData.pullRequests;
      }
      if (syncData.issues) {
        updateData.issues = syncData.issues;
      }

      const repo = await GitHubRepo.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!repo) {
        throw new AppError(404, 'REPO_NOT_FOUND', 'Repository not found');
      }

      return repo;
    } catch (error: any) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update sync data');
    }
  }
}