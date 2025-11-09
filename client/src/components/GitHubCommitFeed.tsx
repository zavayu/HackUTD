import { useGitHub } from './GitHubContext';
import { GitCommit, Plus, Minus, Calendar } from 'lucide-react';

export function GitHubCommitFeed() {
  const { commits } = useGitHub();

  if (commits.length === 0) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Unknown';
    }
    
    const diffInMs = now.getTime() - date.getTime();
    
    // If date is in the future (due to timezone or data issues), show as "Just now"
    if (diffInMs < 0) {
      console.warn('Commit date is in the future:', dateString);
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
  };

  const getCommitType = (message: string) => {
    if (message.startsWith('feat:')) return { label: 'Feature', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (message.startsWith('fix:')) return { label: 'Fix', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (message.startsWith('refactor:')) return { label: 'Refactor', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (message.startsWith('docs:')) return { label: 'Docs', color: 'text-purple-500', bg: 'bg-purple-500/10' };
    return { label: 'Update', color: 'text-muted-foreground', bg: 'bg-accent' };
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Recent Commits</h3>
          <p className="text-sm text-muted-foreground">Latest activity from your team</p>
        </div>
        <GitCommit className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {commits.slice(0, 5).map((commit) => {
          const commitType = getCommitType(commit.message);
          return (
            <div
              key={commit.sha}
              className="p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-primary uppercase">
                    {commit.author.split('.')[0].substring(0, 2)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Commit Message */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded ${commitType.bg} ${commitType.color}`}>
                      {commitType.label}
                    </span>
                    <p className="text-sm truncate flex-1">
                      {commit.message.replace(/^(feat|fix|refactor|docs):\s*/, '')}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(commit.date)}
                    </div>
                    <span>•</span>
                    <code className="px-1 py-0.5 bg-muted rounded text-xs">
                      {commit.sha}
                    </code>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-green-500">
                      <Plus className="w-3 h-3" />
                      <span>{commit.additions}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <Minus className="w-3 h-3" />
                      <span>{commit.deletions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insight */}
      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm">
          <span className="text-primary">🤖 AI Insight:</span> High commit velocity detected
          today. Your team has shipped {commits.slice(0, 5).reduce((acc, c) => acc + c.additions, 0)} lines
          of new code. Consider scheduling a code review session.
        </p>
      </div>
    </div>
  );
}
