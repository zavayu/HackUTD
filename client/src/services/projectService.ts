import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  stats: {
    stories: number;
    sprints: number;
    members: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  project?: T;
  projects?: T[];
  error?: string;
}

class ProjectService {
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

  async getProjects(): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>('/projects');
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>(`/projects/${projectId}`);
  }

  async createProject(name: string, description?: string): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async updateProject(
    projectId: string,
    updates: { name?: string; description?: string; status?: string }
  ): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }
}

export const projectService = new ProjectService();
