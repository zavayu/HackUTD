import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Github, Star, GitFork, AlertCircle, CheckCircle2, Code2, Loader2 } from 'lucide-react';
import { useGitHub } from './GitHubContext';
import { api } from '../services/api';
import { toast } from 'sonner';

interface GitHubConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitHubRepoFromAPI {
  _id: string;
  userId: string;
  repoFullName: string;
  repoId: number;
  repoName: string;
  repoOwner: string;
  repoDescription?: string;
  repoLanguage?: string;
  isActive: boolean;
  lastSyncedAt?: string;
}

interface AvailableGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  description: string | null;
  language: string | null;
  private: boolean;
  stars: number;
  forks: number;
  open_issues: number;
  updated_at: string;
}

export function GitHubConnectionModal({ isOpen, onClose }: GitHubConnectionModalProps) {
  const { repositories, connectGitHub, selectedRepo } = useGitHub();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(
    selectedRepo?.id || null
  );
  const [connectedRepos, setConnectedRepos] = useState<GitHubRepoFromAPI[]>([]);
  const [availableRepos, setAvailableRepos] = useState<AvailableGitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedAvailableRepo, setSelectedAvailableRepo] = useState<string>('');

  // Check if user has GitHub token
  const hasGitHubAuth = !!api.getToken();

  // Load repositories
  useEffect(() => {
    if (isOpen && hasGitHubAuth) {
      loadRepositories();
    }
  }, [isOpen, hasGitHubAuth]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const [connectedResponse, availableResponse] = await Promise.all([
        api.getGitHubRepos(),
        api.getAvailableGitHubRepos()
      ]);
      setConnectedRepos(connectedResponse.data || []);
      setAvailableRepos(availableResponse.data || []);
    } catch (error) {
      console.error('Failed to load repositories:', error);
      toast.error('Failed to load repositories', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubAuth = () => {
    // Initiate GitHub OAuth flow
    api.initiateGitHubAuth();
  };

  const handleConnectRepo = async () => {
    if (!selectedAvailableRepo) {
      toast.error('Please select a repository');
      return;
    }

    try {
      setConnecting(true);
      const response = await api.connectGitHubRepo(selectedAvailableRepo);
      
      toast.success('Repository Connected', {
        description: `Successfully connected to ${selectedAvailableRepo}`,
      });
      
      // Reload repositories
      await loadRepositories();
      setSelectedAvailableRepo('');
    } catch (error: any) {
      toast.error('Connection Failed', {
        description: error.message || 'Failed to connect repository',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSelectRepo = (repo: GitHubRepoFromAPI) => {
    // Convert API repo to GitHubContext format
    const contextRepo = {
      id: repo.repoId,
      name: repo.repoName,
      full_name: repo.repoFullName,
      owner: repo.repoOwner,
      description: repo.repoDescription || '',
      language: repo.repoLanguage || 'Unknown',
      stars: 0,
      forks: 0,
      open_issues: 0,
    };
    
    connectGitHub(contextRepo);
    toast.success('Repository Selected', {
      description: `Now using ${repo.repoFullName}`,
    });
    onClose();
  };

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnect = () => {
    const repo = repositories.find((r) => r.id === selectedRepoId);
    if (repo) {
      connectGitHub(repo);
      toast.success('GitHub Connected', {
        description: `Successfully connected to ${repo.full_name}`,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Github className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Connect to GitHub</DialogTitle>
              <DialogDescription>
                {hasGitHubAuth 
                  ? 'Connect a repository to enable real-time engineering insights'
                  : 'Authenticate with GitHub to access your repositories'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {!hasGitHubAuth ? (
            // GitHub Authentication Required
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Github className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">GitHub Authentication Required</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  To connect your repositories and access real-time data, you need to authenticate with GitHub.
                </p>
              </div>
              <Button onClick={handleGitHubAuth} size="lg" className="gap-2">
                <Github className="w-5 h-5" />
                Authenticate with GitHub
              </Button>
            </div>
          ) : loading ? (
            // Loading State
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            // Connected Repositories
            <>
              {/* Add New Repository */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Repository to Connect</label>
                <div className="flex gap-2">
                  <select
                    value={selectedAvailableRepo}
                    onChange={(e) => setSelectedAvailableRepo(e.target.value)}
                    className="flex-1 px-4 py-2 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Choose a repository...</option>
                    {availableRepos
                      .filter(repo => !connectedRepos.some(cr => cr.repoFullName === repo.full_name))
                      .map((repo) => (
                        <option key={repo.id} value={repo.full_name}>
                          {repo.full_name} {repo.private ? '🔒' : ''}
                          {repo.language ? ` • ${repo.language}` : ''}
                        </option>
                      ))}
                  </select>
                  <Button 
                    onClick={handleConnectRepo} 
                    disabled={connecting || !selectedAvailableRepo}
                  >
                    {connecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
                {selectedAvailableRepo && (
                  <p className="text-xs text-muted-foreground">
                    {availableRepos.find(r => r.full_name === selectedAvailableRepo)?.description || 'No description'}
                  </p>
                )}
              </div>

              {/* Connected Repositories List */}
              {connectedRepos.length > 0 ? (
                <>
                  <div className="text-sm font-medium">Your Connected Repositories</div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {connectedRepos.map((repo) => (
                      <div
                        key={repo._id}
                        onClick={() => handleSelectRepo(repo)}
                        className="p-4 border rounded-xl cursor-pointer transition-all duration-200 border-border hover:border-primary/50 hover:bg-accent/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent">
                              <Code2 className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="truncate">{repo.repoName}</h4>
                                {repo.repoLanguage && (
                                  <span className="text-xs text-muted-foreground px-2 py-0.5 bg-accent rounded">
                                    {repo.repoLanguage}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {repo.repoFullName}
                              </p>
                              {repo.lastSyncedAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last synced: {new Date(repo.lastSyncedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Code2 className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No repositories connected yet. Add one above to get started.
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm">
                  <span className="text-primary">💡 Tip:</span> Select a repository from your GitHub account to connect it to your project. Connected repositories will sync commits, PRs, and issues.
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
