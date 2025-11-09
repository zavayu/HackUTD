const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface ProjectInsights {
  kpis: {
    totalIssues: number;
    completedIssues: number;
    inProgressIssues: number;
    completionRate: number;
    avgCycleTime: number;
    activeSprints: number;
  };
  sprintVelocity: Array<{
    sprint: string;
    completed: number;
    planned: number;
  }>;
  teamPerformance: Array<{
    member: string;
    completed: number;
    inProgress: number;
  }>;
  aiInsights: Array<{
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
  }>;
}

class InsightsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  async getProjectInsights(projectId: string): Promise<ProjectInsights> {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseUrl}/projects/${projectId}/insights`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project insights');
    }

    const data = await response.json();
    return data.data;
  }
}

export const insightsService = new InsightsService();
