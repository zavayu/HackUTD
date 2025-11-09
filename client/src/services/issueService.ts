import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Issue {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug';
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  estimatedHours?: number;
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  issue?: T;
  issues?: T[];
  error?: string;
}

class IssueService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getProjectIssues(projectId: string): Promise<ApiResponse<Issue>> {
    return this.request<ApiResponse<Issue>>(`/issues/project/${projectId}`);
  }

  async getIssue(issueId: string): Promise<ApiResponse<Issue>> {
    return this.request<ApiResponse<Issue>>(`/issues/${issueId}`);
  }

  async createIssue(issueData: {
    projectId: string;
    title: string;
    description?: string;
    type: 'story' | 'task' | 'bug';
    status?: 'backlog' | 'todo' | 'in_progress' | 'done';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    assignee?: string;
    estimatedHours?: number;
    acceptanceCriteria?: string[];
  }): Promise<ApiResponse<Issue>> {
    return this.request<ApiResponse<Issue>>('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async updateIssue(
    issueId: string,
    updates: Partial<Issue>
  ): Promise<ApiResponse<Issue>> {
    return this.request<ApiResponse<Issue>>(`/issues/${issueId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteIssue(issueId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/issues/${issueId}`, {
      method: 'DELETE',
    });
  }
}

export const issueService = new IssueService();
