// Business logic services
export { AuthService } from './AuthService';
export { ProjectService } from './ProjectService';
export { IssueService } from './IssueService';
export { SprintService } from './SprintService';
export { default as GitHubService } from './GitHubService';

// Export service interfaces and types
export type { RegisterData, LoginData, AuthResult } from './AuthService';
export type { 
  CreateProjectDto, 
  UpdateProjectDto, 
  PaginationDto, 
  PaginatedResult 
} from './ProjectService';
export type { 
  CreateIssueDto, 
  UpdateIssueDto, 
  IssueFiltersDto 
} from './IssueService';
export type { 
  CreateSprintDto, 
  UpdateSprintDto 
} from './SprintService';
export type { 
  GitHubCommit, 
  GitHubPullRequest, 
  GitHubIssue,
  SyncResult 
} from './GitHubService';