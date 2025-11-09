const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Get auth token from localStorage
  getToken: () => localStorage.getItem('auth_token'),

  // Set auth token
  setToken: (token: string) => localStorage.setItem('auth_token', token),

  // Remove auth token
  removeToken: () => localStorage.removeItem('auth_token'),

  // GitHub OAuth - Initiate flow
  initiateGitHubAuth: () => {
    window.location.href = `${API_URL}/auth/github`;
  },

  // Get available GitHub repositories from GitHub API
  getAvailableGitHubRepos: async () => {
    const token = api.getToken();
    const response = await fetch(`${API_URL}/github/available-repos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch available GitHub repositories');
    }
    
    return response.json();
  },

  // Get connected GitHub repositories
  getGitHubRepos: async () => {
    const token = api.getToken();
    const response = await fetch(`${API_URL}/github/repos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repositories');
    }
    
    return response.json();
  },

  // Connect a GitHub repository
  connectGitHubRepo: async (repoFullName: string) => {
    const token = api.getToken();
    const response = await fetch(`${API_URL}/github/repos/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ repoFullName }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to connect repository');
    }
    
    return response.json();
  },

  // Disconnect a GitHub repository
  disconnectGitHubRepo: async (repoId: string) => {
    const token = api.getToken();
    const response = await fetch(`${API_URL}/github/repos/${repoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect repository');
    }
    
    return response.json();
  },

  // Sync repository data
  syncGitHubRepo: async (repoId: string) => {
    const token = api.getToken();
    const response = await fetch(`${API_URL}/github/repos/${repoId}/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync repository');
    }
    
    return response.json();
  },

  // Get repository data
  getGitHubRepoData: async (repoId: string) => {
    const token = api.getToken();
    const response = await fetch(`${API_URL}/github/repos/${repoId}/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch repository data');
    }
    
    return response.json();
  },
};
