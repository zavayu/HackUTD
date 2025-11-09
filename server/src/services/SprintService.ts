import { SprintRepository, CreateSprintData, UpdateSprintData } from '../repositories/SprintRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { IssueRepository } from '../repositories/IssueRepository';
import { AppError, ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';
import { ISprint } from '../models/Sprint';


export interface CreateSprintDto {
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status?: 'planned' | 'active' | 'completed';
}

export interface UpdateSprintDto {
  name?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'planned' | 'active' | 'completed';
}

export class SprintService {
  private sprintRepository: SprintRepository;
  private projectRepository: ProjectRepository;
  private issueRepository: IssueRepository;

  constructor() {
    this.sprintRepository = new SprintRepository();
    this.projectRepository = new ProjectRepository();
    this.issueRepository = new IssueRepository();
  }

  /**
   * Create a new sprint with date validation
   * @param projectId - ID of the project the sprint belongs to
   * @param userId - ID of the user creating the sprint
   * @param data - Sprint creation data
   * @returns Promise<ISprint> - The created sprint
   * @throws ValidationError for invalid input data or date ranges
   * @throws NotFoundError if project doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async createSprint(projectId: string, userId: string, data: CreateSprintDto): Promise<ISprint> {
    // Input validation
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Sprint name is required');
    }

    if (data.name.length > 100) {
      throw new ValidationError('Sprint name cannot exceed 100 characters');
    }

    if (!data.goal || data.goal.trim().length === 0) {
      throw new ValidationError('Sprint goal is required');
    }

    if (data.goal.length > 500) {
      throw new ValidationError('Sprint goal cannot exceed 500 characters');
    }

    // Date validation
    this.validateDateRange(data.startDate, data.endDate);

    try {
      // Verify project exists and user has permission
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new NotFoundError('Project');
      }

      if (project.userId.toString() !== userId) {
        throw new AuthorizationError('You do not have permission to create sprints in this project');
      }

      const sprintData: CreateSprintData = {
        projectId,
        name: data.name.trim(),
        goal: data.goal.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || 'planned'
      };

      return await this.sprintRepository.create(sprintData);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'SPRINT_CREATION_FAILED', 'Failed to create sprint');
    }
  }

  /**
   * Get a sprint by ID with project authorization check
   * @param sprintId - ID of the sprint to retrieve
   * @param userId - ID of the user requesting the sprint
   * @returns Promise<ISprint> - The requested sprint
   * @throws NotFoundError if sprint doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async getSprint(sprintId: string, userId: string): Promise<ISprint> {
    try {
      const sprint = await this.sprintRepository.findById(sprintId);
      
      if (!sprint) {
        throw new NotFoundError('Sprint');
      }

      // Verify user owns the project this sprint belongs to
      const project = await this.projectRepository.findById(sprint.projectId.toString());
      if (!project) {
        throw new NotFoundError('Project');
      }

      if (project.userId.toString() !== userId) {
        throw new AuthorizationError('You do not have permission to access this sprint');
      }

      return sprint;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'SPRINT_RETRIEVAL_FAILED', 'Failed to retrieve sprint');
    }
  }

  /**
   * List sprints for a project
   * @param projectId - ID of the project whose sprints to list
   * @param userId - ID of the user requesting the sprints
   * @returns Promise<ISprint[]> - List of sprints for the project
   * @throws NotFoundError if project doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async listSprints(projectId: string, userId: string): Promise<ISprint[]> {
    try {
      // Verify project exists and user has permission
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new NotFoundError('Project');
      }

      if (project.userId.toString() !== userId) {
        throw new AuthorizationError('You do not have permission to access sprints in this project');
      }

      return await this.sprintRepository.findByProjectId(projectId);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'SPRINT_LIST_FAILED', 'Failed to list sprints');
    }
  }

  /**
   * Update a sprint with date validation and authorization check
   * @param sprintId - ID of the sprint to update
   * @param userId - ID of the user updating the sprint
   * @param data - Sprint update data
   * @returns Promise<ISprint> - The updated sprint
   * @throws ValidationError for invalid input data or date ranges
   * @throws NotFoundError if sprint doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async updateSprint(sprintId: string, userId: string, data: UpdateSprintDto): Promise<ISprint> {
    // Input validation
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Sprint name cannot be empty');
      }
      if (data.name.length > 100) {
        throw new ValidationError('Sprint name cannot exceed 100 characters');
      }
    }

    if (data.goal !== undefined) {
      if (!data.goal || data.goal.trim().length === 0) {
        throw new ValidationError('Sprint goal cannot be empty');
      }
      if (data.goal.length > 500) {
        throw new ValidationError('Sprint goal cannot exceed 500 characters');
      }
    }

    try {
      // First verify the sprint exists and user has permission
      const existingSprint = await this.getSprint(sprintId, userId);

      // Date validation - check if dates are being updated
      let startDate = data.startDate || existingSprint.startDate;
      let endDate = data.endDate || existingSprint.endDate;
      
      // If either date is being updated, validate the range
      if (data.startDate !== undefined || data.endDate !== undefined) {
        this.validateDateRange(startDate, endDate);
      }

      const updateData: UpdateSprintData = {};
      
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.goal !== undefined) updateData.goal = data.goal.trim();
      if (data.startDate !== undefined) updateData.startDate = data.startDate;
      if (data.endDate !== undefined) updateData.endDate = data.endDate;
      if (data.status !== undefined) updateData.status = data.status;

      return await this.sprintRepository.update(sprintId, updateData);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'SPRINT_UPDATE_FAILED', 'Failed to update sprint');
    }
  }

  /**
   * Delete a sprint with authorization check
   * @param sprintId - ID of the sprint to delete
   * @param userId - ID of the user deleting the sprint
   * @returns Promise<void>
   * @throws NotFoundError if sprint doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async deleteSprint(sprintId: string, userId: string): Promise<void> {
    try {
      // First verify the sprint exists and user has permission
      await this.getSprint(sprintId, userId);

      // Note: Issues assigned to this sprint will have their sprintId set to null
      // This is handled by the database cascade behavior or can be done explicitly
      // For now, we'll let the repository handle the deletion
      await this.sprintRepository.delete(sprintId);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'SPRINT_DELETION_FAILED', 'Failed to delete sprint');
    }
  }

  /**
   * Get all issues assigned to a sprint
   * @param sprintId - ID of the sprint whose issues to retrieve
   * @param userId - ID of the user requesting the issues
   * @returns Promise<any[]> - List of issues assigned to the sprint
   * @throws NotFoundError if sprint doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async getSprintIssues(sprintId: string, userId: string): Promise<any[]> {
    try {
      // First verify the sprint exists and user has permission
      await this.getSprint(sprintId, userId);

      // Get all issues assigned to this sprint
      return await this.issueRepository.findBySprintId(sprintId);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'SPRINT_ISSUES_RETRIEVAL_FAILED', 'Failed to retrieve sprint issues');
    }
  }

  /**
   * Validate date range ensuring end date is after start date
   * @param startDate - Sprint start date
   * @param endDate - Sprint end date
   * @throws ValidationError if date range is invalid
   */
  private validateDateRange(startDate: Date, endDate: Date): void {
    if (!startDate || !endDate) {
      throw new ValidationError('Both start date and end date are required');
    }

    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new ValidationError('Start date must be a valid date');
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new ValidationError('End date must be a valid date');
    }

    if (endDate <= startDate) {
      throw new ValidationError('End date must be after start date');
    }

    // Optional: Validate that dates are not too far in the past or future
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    if (startDate < oneYearAgo) {
      throw new ValidationError('Start date cannot be more than one year in the past');
    }

    if (endDate > twoYearsFromNow) {
      throw new ValidationError('End date cannot be more than two years in the future');
    }
  }
}