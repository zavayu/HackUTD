const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopilotResponse {
  message: string;
  context: any;
  suggestions: string[];
}

export interface QuickSuggestion {
  type: string;
  title: string;
  description: string;
  action: string;
}

class CopilotService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  async chat(projectId: string, message: string, conversationHistory: CopilotMessage[]): Promise<CopilotResponse> {
    const token = this.getAuthToken();
    const response = await fetch(`${API_URL}/projects/${projectId}/copilot/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, conversationHistory }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Copilot API error:', errorData);
      throw new Error(errorData.message || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.data;
  }

  async getSuggestions(projectId: string): Promise<QuickSuggestion[]> {
    const token = this.getAuthToken();
    const response = await fetch(`${API_URL}/projects/${projectId}/copilot/suggestions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get suggestions');
    }

    const data = await response.json();
    return data.data;
  }
}

export const copilotService = new CopilotService();
