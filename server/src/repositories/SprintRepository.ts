import { Sprint, ISprint } from '../models/Sprint';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';

export interface CreateSprintData {
  projectId: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status?: 'planned' | 'active' | 'completed';
}

export interface UpdateSprintData {
  name?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'planned' | 'active' | 'completed';
}

export class SprintRepository {
  /**
   * Create a new sprint
   */
  async create(data: CreateSprintData): Promise<ISprint> {
    try {
      const sprintData = {
        ...data,
        projectId: new mongoose.Types.ObjectId(data.projectId)
      };
      
      const sprint = new Sprint(sprintData);
      return await sprint.save();
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'Sprint validation failed', messages);
      }
      
      // Handle date validation errors
      if (error.message.includes('End date must be after start date')) {
        throw new AppError(400, 'INVALID_DATE_RANGE', 'End date must be after start date');
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to create sprint');
    }
  }

  /**
   * Find sprint by ID
   */
  async findById(id: string): Promise<ISprint | null> {
    try {
      return await Sprint.findById(id)
        .populate('projectId', 'name')
        .select('name goal startDate endDate status createdAt updatedAt projectId');
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find sprint by ID');
    }
  }

  /**
   * Find sprints by project ID
   */
  async findByProjectId(projectId: string): Promise<ISprint[]> {
    try {
      return await Sprint.find({ projectId: new mongoose.Types.ObjectId(projectId) })
        .select('name goal startDate endDate status createdAt updatedAt') // Query optimization with select()
        .sort({ startDate: -1 });
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to find sprints by project ID');
    }
  }

  /**
   * Update sprint by ID
   */
  async update(id: string, data: UpdateSprintData): Promise<ISprint> {
    try {
      const sprint = await Sprint.findByIdAndUpdate(
        id,
        { $set: data },
        { 
          new: true, 
          runValidators: true 
        }
      )
      .populate('projectId', 'name')
      .select('name goal startDate endDate status createdAt updatedAt projectId');

      if (!sprint) {
        throw new AppError(404, 'SPRINT_NOT_FOUND', 'Sprint not found');
      }

      return sprint;
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new AppError(400, 'VALIDATION_ERROR', 'Sprint validation failed', messages);
      }

      // Handle date validation errors
      if (error.message.includes('End date must be after start date')) {
        throw new AppError(400, 'INVALID_DATE_RANGE', 'End date must be after start date');
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update sprint');
    }
  }

  /**
   * Delete sprint by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const result = await Sprint.findByIdAndDelete(id);
      
      if (!result) {
        throw new AppError(404, 'SPRINT_NOT_FOUND', 'Sprint not found');
      }
    } catch (error: any) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete sprint');
    }
  }

  /**
   * Delete all sprints by project ID (for cascade delete)
   */
  async deleteByProjectId(projectId: string): Promise<void> {
    try {
      await Sprint.deleteMany({ projectId: new mongoose.Types.ObjectId(projectId) });
    } catch (error) {
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to delete sprints by project ID');
    }
  }
}