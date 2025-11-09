export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  sprintId?: string;
  assignee?: string;
  storyPoints: number;
}

export interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  addedAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  members?: ProjectMember[];
  stats?: {
    stories: number;
    sprints: number;
    members: number;
  };
  starred?: boolean;
}

export type ViewType = 'home' | 'login' | 'projects' | 'project';
export type TabType = 'dashboard' | 'backlog' | 'board' | 'sprints' | 'insights' | 'settings';
export type WorkspaceTabType = 'backlog' | 'board';
export type ThemeMode = 'light' | 'dark' | 'system';
