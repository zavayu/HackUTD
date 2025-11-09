import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Sprint {
  _id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  stats?: {
    totalIssues: number;
    completedIssues: number;
    completionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  sprint?: T;
  sprints?: T[];
  error?: string;
}

class SprintService {
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

  async getProjectSprints(projectId: string): Promise<ApiResponse<Sprint>> {
    return this.request<ApiResponse<Sprint>>(`/sprints/project/${projectId}`);
  }

  async getActiveSprint(projectId: string): Promise<ApiResponse<Sprint>> {
    return this.request<ApiResponse<Sprint>>(`/sprints/project/${projectId}/active`);
  }

  async createSprint(sprintData: {
    projectId: string;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<Sprint>> {
    return this.request<ApiResponse<Sprint>>('/sprints', {
      method: 'POST',
      body: JSON.stringify(sprintData),
    });
  }

  async startSprint(sprintId: string): Promise<ApiResponse<Sprint>> {
    return this.request<ApiResponse<Sprint>>(`/sprints/${sprintId}/start`, {
      method: 'POST',
    });
  }

  async completeSprint(sprintId: string): Promise<ApiResponse<Sprint>> {
    return this.request<ApiResponse<Sprint>>(`/sprints/${sprintId}/complete`, {
      method: 'POST',
    });
  }

  async addIssuesToSprint(sprintId: string, issueIds: string[]): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/sprints/${sprintId}/issues`, {
      method: 'POST',
      body: JSON.stringify({ issueIds }),
    });
  }

  async removeIssueFromSprint(sprintId: string, issueId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/sprints/${sprintId}/issues/${issueId}`, {
      method: 'DELETE',
    });
  }
}

export const sprintService = new SprintService();
