const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error: any = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error: any) {
      // Don't log 404 errors as they're expected when user doesn't exist yet
      if (error.status !== 404) {
        console.error('API Error:', error);
      }
      throw error;
    }
  }

  // Create or update user after Firebase signup
  async createFirebaseUser(userData: {
    firebaseUid: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/firebase-signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Get user by Firebase UID
  async getFirebaseUser(firebaseUid: string): Promise<ApiResponse> {
    return this.request(`/auth/firebase-user/${firebaseUid}`, {
      method: 'GET',
    });
  }

  // Update user profile
  async updateUser(
    firebaseUid: string,
    updates: {
      name?: string;
      avatar?: string;
      role?: string;
    }
  ): Promise<ApiResponse> {
    return this.request(`/auth/user/${firebaseUid}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const apiService = new ApiService();
