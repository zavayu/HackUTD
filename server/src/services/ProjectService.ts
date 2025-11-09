import { ProjectRepository, CreateProjectData, UpdateProjectData, Pagination } from '../repositories/ProjectRepository';
import { IssueRepository } from '../repositories/IssueRepository';
import { SprintRepository } from '../repositories/SprintRepository';
import { AppError, ValidationError, AuthorizationError, NotFoundError } from '../utils/errors';
import { IProject } from '../models/Project';

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: 'active' | 'archived';
  connectedRepos?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: 'active' | 'archived';
  connectedRepos?: string[];
}

export interface PaginationDto {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ProjectService {
  private projectRepository: ProjectRepository;
  private issueRepository: IssueRepository;
  private sprintRepository: SprintRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.issueRepository = new IssueRepository();
    this.sprintRepository = new SprintRepository();
  }

  /**
   * Create a new project
   * @param userId - ID of the user creating the project
   * @param data - Project creation data
   * @returns Promise<IProject> - The created project
   * @throws ValidationError for invalid input data
   * @throws AppError for database errors
   */
  async createProject(userId: string, data: CreateProjectDto): Promise<IProject> {
    // Input validation
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    if (data.name.length > 100) {
      throw new ValidationError('Project name cannot exceed 100 characters');
    }

    if (data.description && data.description.length > 500) {
      throw new ValidationError('Project description cannot exceed 500 characters');
    }

    try {
      const projectData: CreateProjectData = {
        userId,
        name: data.name.trim(),
        status: data.status || 'active',
        connectedRepos: data.connectedRepos || []
      };

      if (data.description) {
        projectData.description = data.description.trim();
      }

      return await this.projectRepository.create(projectData);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'PROJECT_CREATION_FAILED', 'Failed to create project');
    }
  }

  /**
   * Get a project by ID with authorization check
   * @param projectId - ID of the project to retrieve
   * @param userId - ID of the user requesting the project
   * @returns Promise<IProject> - The requested project
   * @throws NotFoundError if project doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async getProject(projectId: string, userId: string): Promise<IProject> {
    try {
      const project = await this.projectRepository.findById(projectId);
      
      if (!project) {
        throw new NotFoundError('Project');
      }

      // Authorization check - verify user owns project
      if (project.userId.toString() !== userId) {
        throw new AuthorizationError('You do not have permission to access this project');
      }

      return project;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'PROJECT_RETRIEVAL_FAILED', 'Failed to retrieve project');
    }
  }

  /**
   * List projects for a user with pagination support
   * @param userId - ID of the user whose projects to list
   * @param pagination - Pagination parameters
   * @returns Promise<PaginatedResult<IProject>> - Paginated list of projects
   * @throws ValidationError for invalid pagination parameters
   * @throws AppError for database errors
   */
  async listProjects(userId: string, pagination: PaginationDto): Promise<PaginatedResult<IProject>> {
    // Validate pagination parameters
    if (pagination.page < 1) {
      throw new ValidationError('Page number must be greater than 0');
    }

    if (pagination.limit < 1 || pagination.limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    try {
      const paginationParams: Pagination = {
        page: pagination.page,
        limit: pagination.limit
      };

      // Get projects and total count
      const [projects, total] = await Promise.all([
        this.projectRepository.findByUserId(userId, paginationParams),
        this.projectRepository.countByUserId(userId)
      ]);

      const totalPages = Math.ceil(total / pagination.limit);

      return {
        data: projects,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'PROJECT_LIST_FAILED', 'Failed to list projects');
    }
  }

  /**
   * Update a project with authorization check
   * @param projectId - ID of the project to update
   * @param userId - ID of the user updating the project
   * @param data - Project update data
   * @returns Promise<IProject> - The updated project
   * @throws ValidationError for invalid input data
   * @throws NotFoundError if project doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async updateProject(projectId: string, userId: string, data: UpdateProjectDto): Promise<IProject> {
    // Input validation
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Project name cannot be empty');
      }
      if (data.name.length > 100) {
        throw new ValidationError('Project name cannot exceed 100 characters');
      }
    }

    if (data.description !== undefined && data.description.length > 500) {
      throw new ValidationError('Project description cannot exceed 500 characters');
    }

    try {
      const updateData: UpdateProjectData = {};
      
      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }
      if (data.description !== undefined) {
        updateData.description = data.description.trim();
      }
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      if (data.connectedRepos !== undefined) {
        updateData.connectedRepos = data.connectedRepos;
      }

      // The repository handles authorization check internally
      return await this.projectRepository.update(projectId, userId, updateData);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'PROJECT_UPDATE_FAILED', 'Failed to update project');
    }
  }

  /**
   * Delete a project with cascade delete for issues and sprints
   * @param projectId - ID of the project to delete
   * @param userId - ID of the user deleting the project
   * @returns Promise<void>
   * @throws NotFoundError if project doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      // First verify the project exists and user has permission
      await this.getProject(projectId, userId);

      // Cascade delete: Delete all issues and sprints first
      await Promise.all([
        this.issueRepository.deleteByProjectId(projectId),
        this.sprintRepository.deleteByProjectId(projectId)
      ]);

      // Delete the project (repository handles authorization check)
      await this.projectRepository.delete(projectId, userId);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'PROJECT_DELETION_FAILED', 'Failed to delete project');
    }
  }
}