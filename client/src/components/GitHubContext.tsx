import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Mock GitHub data types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  open_issues: number;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  labels: string[];
  reviews: number;
}

export interface GitHubMetrics {
  totalCommits: number;
  totalPRs: number;
  openPRs: number;
  mergedPRs: number;
  avgReviewTime: number;
  codeChurn: number;
  activeContributors: number;
}

interface GitHubContextType {
  isConnected: boolean;
  selectedRepo: GitHubRepo | null;
  repositories: GitHubRepo[];
  commits: GitHubCommit[];
  pullRequests: GitHubPR[];
  metrics: GitHubMetrics | null;
  connectGitHub: (repo: GitHubRepo) => void;
  disconnectGitHub: () => void;
  refreshData: () => void;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

// Mock data
const mockRepositories: GitHubRepo[] = [
  {
    id: 1,
    name: 'prodigy-frontend',
    full_name: 'acme-corp/prodigy-frontend',
    owner: 'acme-corp',
    description: 'Modern React frontend for ProdigyPM',
    language: 'TypeScript',
    stars: 156,
    forks: 23,
    open_issues: 12,
  },
  {
    id: 2,
    name: 'prodigy-api',
    full_name: 'acme-corp/prodigy-api',
    owner: 'acme-corp',
    description: 'Backend API service for ProdigyPM',
    language: 'Python',
    stars: 89,
    forks: 15,
    open_issues: 8,
  },
  {
    id: 3,
    name: 'prodigy-mobile',
    full_name: 'acme-corp/prodigy-mobile',
    owner: 'acme-corp',
    description: 'Mobile app for ProdigyPM',
    language: 'React Native',
    stars: 67,
    forks: 11,
    open_issues: 5,
  },
];

const mockCommits: GitHubCommit[] = [
  {
    sha: 'a1b2c3d',
    message: 'feat: Add GitHub integration to dashboard',
    author: 'sarah.chen',
    date: '2025-11-08T10:30:00Z',
    additions: 245,
    deletions: 32,
  },
  {
    sha: 'e4f5g6h',
    message: 'fix: Resolve sprint burndown calculation bug',
    author: 'mike.torres',
    date: '2025-11-08T09:15:00Z',
    additions: 18,
    deletions: 12,
  },
  {
    sha: 'i7j8k9l',
    message: 'refactor: Optimize backlog query performance',
    author: 'emily.park',
    date: '2025-11-07T16:45:00Z',
    additions: 134,
    deletions: 89,
  },
  {
    sha: 'm1n2o3p',
    message: 'docs: Update API documentation',
    author: 'alex.rivera',
    date: '2025-11-07T14:20:00Z',
    additions: 67,
    deletions: 23,
  },
  {
    sha: 'q4r5s6t',
    message: 'feat: Implement AI-powered story suggestions',
    author: 'sarah.chen',
    date: '2025-11-07T11:00:00Z',
    additions: 412,
    deletions: 56,
  },
];

const mockPullRequests: GitHubPR[] = [
  {
    id: 1,
    number: 234,
    title: 'Add GitHub integration layer',
    author: 'sarah.chen',
    state: 'open',
    created_at: '2025-11-08T08:00:00Z',
    labels: ['enhancement', 'feature'],
    reviews: 2,
  },
  {
    id: 2,
    number: 233,
    title: 'Fix sprint velocity calculation',
    author: 'mike.torres',
    state: 'merged',
    created_at: '2025-11-07T15:30:00Z',
    labels: ['bug', 'critical'],
    reviews: 3,
  },
  {
    id: 3,
    number: 232,
    title: 'Improve backlog filtering performance',
    author: 'emily.park',
    state: 'open',
    created_at: '2025-11-07T12:00:00Z',
    labels: ['performance', 'enhancement'],
    reviews: 1,
  },
  {
    id: 4,
    number: 231,
    title: 'Update dependencies to latest versions',
    author: 'alex.rivera',
    state: 'merged',
    created_at: '2025-11-06T10:00:00Z',
    labels: ['maintenance'],
    reviews: 2,
  },
];

const mockMetrics: GitHubMetrics = {
  totalCommits: 1247,
  totalPRs: 234,
  openPRs: 12,
  mergedPRs: 198,
  avgReviewTime: 4.2,
  codeChurn: 18,
  activeContributors: 8,
};

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [repositories] = useState<GitHubRepo[]>(mockRepositories);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [pullRequests, setPullRequests] = useState<GitHubPR[]>([]);
  const [metrics, setMetrics] = useState<GitHubMetrics | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedConnection = localStorage.getItem('github_connection');
    if (savedConnection) {
      const data = JSON.parse(savedConnection);
      setIsConnected(true);
      setSelectedRepo(data.repo);
      setCommits(mockCommits);
      setPullRequests(mockPullRequests);
      setMetrics(mockMetrics);
    }
  }, []);

  const connectGitHub = (repo: GitHubRepo) => {
    setIsConnected(true);
    setSelectedRepo(repo);
    setCommits(mockCommits);
    setPullRequests(mockPullRequests);
    setMetrics(mockMetrics);

    // Save to localStorage
    localStorage.setItem(
      'github_connection',
      JSON.stringify({
        repo,
        timestamp: new Date().toISOString(),
      })
    );
  };

  const disconnectGitHub = () => {
    setIsConnected(false);
    setSelectedRepo(null);
    setCommits([]);
    setPullRequests([]);
    setMetrics(null);
    localStorage.removeItem('github_connection');
  };

  const refreshData = () => {
    // Simulate data refresh
    setCommits(mockCommits);
    setPullRequests(mockPullRequests);
    setMetrics(mockMetrics);
  };

  return (
    <GitHubContext.Provider
      value={{
        isConnected,
        selectedRepo,
        repositories,
        commits,
        pullRequests,
        metrics,
        connectGitHub,
        disconnectGitHub,
        refreshData,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
}

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
}
