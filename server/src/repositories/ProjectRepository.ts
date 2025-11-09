import { Project, IProject } from '../models/Project';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

export interface CreateProjectData {
  userId: string;
  name: string;
  description?: string;
  status?: 'active' | 'archived';
  connectedRepos?: string[];
  members?: Array<{
    userId: mongoose.Types.ObjectId | string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'member';
    addedAt: Date;
  }>;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'archived';
  connectedRepos?: string[];
}

export interface Pagination {
  page: number;
  limit: number;
}

export class ProjectRepository {
  /**
   * Create a new project
   */
  async create(data: CreateProjectData): Promise<IProject> {
    try {
      const projectData = {
        ...data,
        userId: new mongoose.Types.ObjectId(data.userId),
        connectedRepos: data.connectedRepos?.map(id => new mongoose.Types.ObjectId(id)) || []
      };
      
      const project = new Project(projectData);
      return await project.save();
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'Project validation failed', messages);
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to create project');
    }
  }

  /**
   * Find project by ID
   */
  async findById(id: string): Promise<IProject | null> {
    try {
      return await Project.findById(id).populate('connectedRepos');
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find project by ID');
    }
  }

  /**
   * Find projects by user ID with pagination
   */
  async findByUserId(userId: string, pagination?: Pagination): Promise<IProject[]> {
    try {
      const query = Project.find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate('connectedRepos')
        .sort({ updatedAt: -1 });

      if (pagination) {
        const skip = (pagination.page - 1) * pagination.limit;
        query.skip(skip).limit(pagination.limit);
      }

      return await query.exec();
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find projects by user ID');
    }
  }

  /**
   * Update project by ID (with user authorization check)
   */
  async update(id: string, userId: string, data: UpdateProjectData): Promise<IProject> {
    try {
      const updateData: any = { ...data };
      
      // Convert connectedRepos to ObjectIds if provided
      if (data.connectedRepos) {
        updateData.connectedRepos = data.connectedRepos.map(id => new mongoose.Types.ObjectId(id));
      }

      const project = await Project.findOneAndUpdate(
        { 
          _id: new mongoose.Types.ObjectId(id),
          userId: new mongoose.Types.ObjectId(userId) // Authorization filter
        },
        { $set: updateData },
        { 
          new: true, 
          runValidators: true 
        }
      ).populate('connectedRepos');

      if (!project) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found or access denied');
      }

      return project;
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'Project validation failed', messages);
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update project');
    }
  }

  /**
   * Delete project by ID (with user authorization check and cascade delete)
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      const project = await Project.findOne({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId) // Authorization filter
      });
      
      if (!project) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found or access denied');
      }

      // Use deleteOne to trigger pre-remove middleware for cascade delete
      await project.deleteOne();
    } catch (error: any) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete project');
    }
  }

  /**
   * Count projects by user ID
   */
  async countByUserId(userId: string): Promise<number> {
    try {
      return await Project.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to count projects by user ID');
    }
  }
}