import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Github, Star, GitFork, AlertCircle, CheckCircle2, Code2 } from 'lucide-react';
import { useGitHub } from './GitHubContext';
import { toast } from 'sonner@2.0.3';

interface GitHubConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitHubConnectionModal({ isOpen, onClose }: GitHubConnectionModalProps) {
  const { repositories, connectGitHub, selectedRepo } = useGitHub();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(
    selectedRepo?.id || null
  );

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
                Select a repository to enable real-time engineering insights
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>

          {/* Repository List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredRepos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => setSelectedRepoId(repo.id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedRepoId === repo.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        selectedRepoId === repo.id
                          ? 'bg-primary/20'
                          : 'bg-accent'
                      }`}
                    >
                      <Code2
                        className={`w-5 h-5 ${
                          selectedRepoId === repo.id
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="truncate">{repo.name}</h4>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-accent rounded">
                          {repo.language}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {repo.description}
                      </p>
                    </div>
                  </div>
                  {selectedRepoId === repo.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    <span>{repo.forks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{repo.open_issues} issues</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <span className="text-primary">💡 Note:</span> This demo uses mock GitHub
              data. In production, you would authenticate with GitHub OAuth and access
              real repository data via the GitHub API.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!selectedRepoId}
              className="flex-1"
            >
              <Github className="w-4 h-4 mr-2" />
              Connect Repository
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
