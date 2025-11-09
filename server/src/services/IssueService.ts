import { IssueRepository, CreateIssueData, UpdateIssueData, IssueFilters } from '../repositories/IssueRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { SprintRepository } from '../repositories/SprintRepository';
import { AppError, ValidationError, NotFoundError, AuthorizationError } from '../utils/errors';
import { IIssue } from '../models/Issue';

export interface CreateIssueDto {
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug';
  status?: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  priorityScore?: number;
  assignee?: string;
  estimatedHours?: number;
  acceptanceCriteria?: string[];
  sprintId?: string;
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  type?: 'story' | 'task' | 'bug';
  status?: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  priorityScore?: number;
  assignee?: string;
  estimatedHours?: number;
  acceptanceCriteria?: string[];
  sprintId?: string;
}

export interface IssueFiltersDto {
  status?: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  type?: 'story' | 'task' | 'bug';
  assignee?: string;
  sprintId?: string;
}

export class IssueService {
  private issueRepository: IssueRepository;
  private projectRepository: ProjectRepository;
  private sprintRepository: SprintRepository;

  constructor() {
    this.issueRepository = new IssueRepository();
    this.projectRepository = new ProjectRepository();
    this.sprintRepository = new SprintRepository();
  }

  /**
   * Create a new issue
   * @param projectId - ID of the project the issue belongs to
   * @param userId - ID of the user creating the issue
   * @param data - Issue creation data
   * @returns Promise<IIssue> - The created issue
   * @throws ValidationError for invalid input data
   * @throws NotFoundError if project doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async createIssue(projectId: string, userId: string, data: CreateIssueDto): Promise<IIssue> {
    // Input validation
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Issue title is required');
    }

    if (data.title.length > 200) {
      throw new ValidationError('Issue title cannot exceed 200 characters');
    }

    if (data.description && data.description.length > 2000) {
      throw new ValidationError('Issue description cannot exceed 2000 characters');
    }

    if (data.estimatedHours !== undefined && (data.estimatedHours < 0 || data.estimatedHours > 1000)) {
      throw new ValidationError('Estimated hours must be between 0 and 1000');
    }

    if (data.priorityScore !== undefined && (data.priorityScore < 1 || data.priorityScore > 100)) {
      throw new ValidationError('Priority score must be between 1 and 100');
    }

    try {
      // Verify project exists and user has permission
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new NotFoundError('Project');
      }

      // Check if user is owner or member
      const isOwner = project.userId.toString() === userId;
      const isMember = project.members?.some((member: any) => member.userId.toString() === userId);
      
      if (!isOwner && !isMember) {
        throw new AuthorizationError('You do not have permission to create issues in this project');
      }

      // If sprint is specified, validate it belongs to the same project
      if (data.sprintId) {
        await this.validateSprintBelongsToProject(data.sprintId, projectId);
      }

      const issueData: CreateIssueData = {
        projectId,
        title: data.title.trim(),
        type: data.type,
        status: data.status || 'backlog',
        priority: data.priority || 'medium',
        acceptanceCriteria: data.acceptanceCriteria || []
      };

      if (data.description) {
        issueData.description = data.description.trim();
      }
      if (data.priorityScore !== undefined) {
        issueData.priorityScore = data.priorityScore;
      }
      if (data.assignee) {
        issueData.assignee = data.assignee.trim();
      }
      if (data.estimatedHours !== undefined) {
        issueData.estimatedHours = data.estimatedHours;
      }
      if (data.sprintId) {
        issueData.sprintId = data.sprintId;
      }

      return await this.issueRepository.create(issueData);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'ISSUE_CREATION_FAILED', 'Failed to create issue');
    }
  }

  /**
   * Get an issue by ID with project authorization check
   * @param issueId - ID of the issue to retrieve
   * @param userId - ID of the user requesting the issue
   * @returns Promise<IIssue> - The requested issue
   * @throws NotFoundError if issue doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async getIssue(issueId: string, userId: string): Promise<IIssue> {
    try {
      const issue = await this.issueRepository.findById(issueId);
      
      if (!issue) {
        throw new NotFoundError('Issue');
      }

      // Verify user owns the project this issue belongs to
      const project = await this.projectRepository.findById(issue.projectId.toString());
      if (!project) {
        throw new NotFoundError('Project');
      }

      // Check if user is owner or member
      const isOwner = project.userId.toString() === userId;
      const isMember = project.members?.some((member: any) => member.userId.toString() === userId);
      
      if (!isOwner && !isMember) {
        throw new AuthorizationError('You do not have permission to access this issue');
      }

      return issue;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'ISSUE_RETRIEVAL_FAILED', 'Failed to retrieve issue');
    }
  }

  /**
   * List issues for a project with filtering
   * @param projectId - ID of the project whose issues to list
   * @param userId - ID of the user requesting the issues
   * @param filters - Optional filters for status, priority, type, assignee, sprint
   * @returns Promise<any[]> - List of issues matching the filters
   * @throws NotFoundError if project doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async listIssues(projectId: string, userId: string, filters?: IssueFiltersDto): Promise<any[]> {
    try {
      // Verify project exists and user has permission
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new NotFoundError('Project');
      }

      // Check if user is owner or member
      const projectOwnerId = project.userId?.toString() || project.userId;
      const isOwner = projectOwnerId === userId || projectOwnerId === userId.toString();
      const isMember = project.members?.some((member: any) => {
        const memberId = member.userId?.toString() || member.userId;
        return memberId === userId || memberId === userId.toString();
      });
      
      if (!isOwner && !isMember) {
        throw new AuthorizationError('You do not have permission to access issues in this project');
      }

      // Convert filters to repository format
      const repositoryFilters: IssueFilters = {};
      if (filters?.status) repositoryFilters.status = filters.status;
      if (filters?.priority) repositoryFilters.priority = filters.priority;
      if (filters?.type) repositoryFilters.type = filters.type;
      if (filters?.assignee) repositoryFilters.assignee = filters.assignee;

      let issues = await this.issueRepository.findByProjectId(projectId, repositoryFilters);

      // Additional filtering by sprint if specified
      if (filters?.sprintId) {
        issues = issues.filter(issue => issue.sprintId?.toString() === filters.sprintId);
      }

      return issues;
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'ISSUE_LIST_FAILED', 'Failed to list issues');
    }
  }

  /**
   * Update an issue with authorization check
   * @param issueId - ID of the issue to update
   * @param userId - ID of the user updating the issue
   * @param data - Issue update data
   * @returns Promise<IIssue> - The updated issue
   * @throws ValidationError for invalid input data
   * @throws NotFoundError if issue doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async updateIssue(issueId: string, userId: string, data: UpdateIssueDto): Promise<IIssue> {
    // Input validation
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new ValidationError('Issue title cannot be empty');
      }
      if (data.title.length > 200) {
        throw new ValidationError('Issue title cannot exceed 200 characters');
      }
    }

    if (data.description !== undefined && data.description.length > 2000) {
      throw new ValidationError('Issue description cannot exceed 2000 characters');
    }

    if (data.estimatedHours !== undefined && (data.estimatedHours < 0 || data.estimatedHours > 1000)) {
      throw new ValidationError('Estimated hours must be between 0 and 1000');
    }

    if (data.priorityScore !== undefined && (data.priorityScore < 1 || data.priorityScore > 100)) {
      throw new ValidationError('Priority score must be between 1 and 100');
    }

    try {
      // First verify the issue exists and user has permission
      const existingIssue = await this.getIssue(issueId, userId);

      // If sprint is being updated, validate it belongs to the same project
      if (data.sprintId) {
        await this.validateSprintBelongsToProject(data.sprintId, existingIssue.projectId.toString());
      }

      const updateData: UpdateIssueData = {};
      
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      if (data.type !== undefined) updateData.type = data.type;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.priorityScore !== undefined) updateData.priorityScore = data.priorityScore;
      if (data.assignee !== undefined) updateData.assignee = data.assignee?.trim();
      if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
      if (data.acceptanceCriteria !== undefined) updateData.acceptanceCriteria = data.acceptanceCriteria;
      if (data.sprintId !== undefined) updateData.sprintId = data.sprintId;

      return await this.issueRepository.update(issueId, updateData);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'ISSUE_UPDATE_FAILED', 'Failed to update issue');
    }
  }

  /**
   * Delete an issue with authorization check
   * @param issueId - ID of the issue to delete
   * @param userId - ID of the user deleting the issue
   * @returns Promise<void>
   * @throws NotFoundError if issue doesn't exist
   * @throws AuthorizationError if user doesn't own the project
   */
  async deleteIssue(issueId: string, userId: string): Promise<void> {
    try {
      // First verify the issue exists and user has permission
      await this.getIssue(issueId, userId);

      // Delete the issue
      await this.issueRepository.delete(issueId);
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'ISSUE_DELETION_FAILED', 'Failed to delete issue');
    }
  }

  /**
   * Assign an issue to a sprint with validation
   * @param issueId - ID of the issue to assign
   * @param sprintId - ID of the sprint to assign the issue to
   * @param userId - ID of the user performing the assignment
   * @returns Promise<IIssue> - The updated issue
   * @throws NotFoundError if issue or sprint doesn't exist
   * @throws ValidationError if sprint doesn't belong to the same project
   * @throws AuthorizationError if user doesn't own the project
   */
  async assignToSprint(issueId: string, sprintId: string, userId: string): Promise<IIssue> {
    try {
      // First verify the issue exists and user has permission
      const issue = await this.getIssue(issueId, userId);

      // Validate sprint belongs to same project
      await this.validateSprintBelongsToProject(sprintId, issue.projectId.toString());

      // Update the issue with the sprint assignment
      return await this.issueRepository.update(issueId, { sprintId });
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(500, 'SPRINT_ASSIGNMENT_FAILED', 'Failed to assign issue to sprint');
    }
  }

  /**
   * Validate that a sprint belongs to the specified project
   * @param sprintId - ID of the sprint to validate
   * @param projectId - ID of the project the sprint should belong to
   * @throws NotFoundError if sprint doesn't exist
   * @throws ValidationError if sprint doesn't belong to the project
   */
  private async validateSprintBelongsToProject(sprintId: string, projectId: string): Promise<void> {
    const sprint = await this.sprintRepository.findById(sprintId);
    
    if (!sprint) {
      throw new NotFoundError('Sprint');
    }

    if (sprint.projectId.toString() !== projectId) {
      throw new ValidationError('Sprint must belong to the same project as the issue');
    }
  }
}