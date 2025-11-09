import { Issue, IIssue } from '../models/Issue';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

export interface CreateIssueData {
  projectId: string;
  sprintId?: string;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug';
  status?: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  priorityScore?: number;
  assignee?: string;
  estimatedHours?: number;
  acceptanceCriteria?: string[];
  embeddingId?: string;
}

export interface UpdateIssueData {
  sprintId?: string;
  title?: string;
  description?: string;
  type?: 'story' | 'task' | 'bug';
  status?: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  priorityScore?: number;
  assignee?: string;
  estimatedHours?: number;
  acceptanceCriteria?: string[];
  embeddingId?: string;
}

export interface IssueFilters {
  status?: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  type?: 'story' | 'task' | 'bug';
  assignee?: string;
}

export class IssueRepository {
  /**
   * Create a new issue
   */
  async create(data: CreateIssueData): Promise<IIssue> {
    try {
      const issueData = {
        ...data,
        projectId: new mongoose.Types.ObjectId(data.projectId),
        sprintId: data.sprintId ? new mongoose.Types.ObjectId(data.sprintId) : undefined
      };
      
      const issue = new Issue(issueData);
      return await issue.save();
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'Issue validation failed', messages);
      }
      
      // Handle custom validation errors (sprint-project relationship)
      if (error.message.includes('Sprint must belong to the same project')) {
        throw new AppError(400, 'INVALID_SPRINT', 'Sprint must belong to the same project as the issue');
      }
      
      if (error.message.includes('Sprint not found')) {
        throw new AppError(404, 'SPRINT_NOT_FOUND', 'Sprint not found');
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to create issue');
    }
  }

  /**
   * Find issue by ID
   */
  async findById(id: string): Promise<IIssue | null> {
    try {
      return await Issue.findById(id)
        .populate('projectId', 'name')
        .populate('sprintId', 'name');
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find issue by ID');
    }
  }

  /**
   * Find issues by project ID with optional filters
   */
  async findByProjectId(projectId: string, filters?: IssueFilters): Promise<any[]> {
    try {
      const query: any = { projectId: new mongoose.Types.ObjectId(projectId) };
      
      // Apply filters
      if (filters?.status) {
        query.status = filters.status;
      }
      if (filters?.priority) {
        query.priority = filters.priority;
      }
      if (filters?.type) {
        query.type = filters.type;
      }
      if (filters?.assignee) {
        query.assignee = filters.assignee;
      }

      return await Issue.find(query)
        .populate('sprintId', 'name')
        .sort({ priorityScore: -1, updatedAt: -1 })
        .lean(); // Use lean() for read-only queries for better performance
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find issues by project ID');
    }
  }

  /**
   * Find issues by sprint ID
   */
  async findBySprintId(sprintId: string): Promise<any[]> {
    try {
      return await Issue.find({ sprintId: new mongoose.Types.ObjectId(sprintId) })
        .populate('projectId', 'name')
        .sort({ priority: 1, updatedAt: -1 })
        .lean(); // Use lean() for read-only queries
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find issues by sprint ID');
    }
  }

  /**
   * Update issue by ID
   */
  async update(id: string, data: UpdateIssueData): Promise<IIssue> {
    try {
      const updateData: any = { ...data };
      
      // Convert sprintId to ObjectId if provided
      if (data.sprintId) {
        updateData.sprintId = new mongoose.Types.ObjectId(data.sprintId);
      }

      const issue = await Issue.findByIdAndUpdate(
        id,
        { $set: updateData },
        { 
          new: true, 
          runValidators: true 
        }
      )
      .populate('projectId', 'name')
      .populate('sprintId', 'name');

      if (!issue) {
        throw new AppError(404, 'ISSUE_NOT_FOUND', 'Issue not found');
      }

      return issue;
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'Issue validation failed', messages);
      }

      // Handle custom validation errors (sprint-project relationship)
      if (error.message.includes('Sprint must belong to the same project')) {
        throw new AppError(400, 'INVALID_SPRINT', 'Sprint must belong to the same project as the issue');
      }
      
      if (error.message.includes('Sprint not found')) {
        throw new AppError(404, 'SPRINT_NOT_FOUND', 'Sprint not found');
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update issue');
    }
  }

  /**
   * Delete issue by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await Issue.findByIdAndDelete(id);
      
      if (!result) {
        throw new AppError(404, 'ISSUE_NOT_FOUND', 'Issue not found');
      }
    } catch (error: any) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete issue');
    }
  }

  /**
   * Delete all issues by project ID (for cascade delete)
   */
  async deleteByProjectId(projectId: string): Promise<void> {
    try {
      await Issue.deleteMany({ projectId: new mongoose.Types.ObjectId(projectId) });
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete issues by project ID');
    }
  }
}