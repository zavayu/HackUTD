import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface GeneratedStory {
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  acceptanceCriteria: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  story?: T;
  stories?: T[];
  error?: string;
}

class AIService {
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

  async generateStory(prompt: string, projectId?: string): Promise<ApiResponse<GeneratedStory>> {
    return this.request<ApiResponse<GeneratedStory>>('/ai/generate-story', {
      method: 'POST',
      body: JSON.stringify({ prompt, projectId }),
    });
  }

  async generateMultipleStories(
    prompt: string,
    count: number = 3,
    projectId?: string
  ): Promise<ApiResponse<GeneratedStory>> {
    return this.request<ApiResponse<GeneratedStory>>('/ai/generate-stories', {
      method: 'POST',
      body: JSON.stringify({ prompt, count, projectId }),
    });
  }

  async enhanceStory(story: Partial<GeneratedStory>): Promise<ApiResponse<GeneratedStory>> {
    return this.request<ApiResponse<GeneratedStory>>('/ai/enhance-story', {
      method: 'POST',
      body: JSON.stringify({ story }),
    });
  }
}

export const aiService = new AIService();
