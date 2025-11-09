import { useGitHub } from './GitHubContext';
import { GitPullRequest, MessageSquare, CheckCircle2, GitMerge, AlertCircle } from 'lucide-react';

export function GitHubPRTracker() {
  const { pullRequests } = useGitHub();

  if (pullRequests.length === 0) return null;

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'merged':
        return <GitMerge className="w-4 h-4 text-purple-500" />;
      case 'closed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <GitPullRequest className="w-4 h-4 text-green-500" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'merged':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'closed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const openPRs = pullRequests.filter((pr) => pr.state === 'open');
  const mergedPRs = pullRequests.filter((pr) => pr.state === 'merged');

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Pull Requests</h3>
          <p className="text-sm text-muted-foreground">
            {openPRs.length} open • {mergedPRs.length} merged
          </p>
        </div>
        <GitPullRequest className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
          <div className="text-xs text-green-500 mb-1">Open</div>
          <div className="text-2xl text-green-500">{openPRs.length}</div>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
          <div className="text-xs text-purple-500 mb-1">Merged</div>
          <div className="text-2xl text-purple-500">{mergedPRs.length}</div>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
          <div className="text-xs text-primary mb-1">Total</div>
          <div className="text-2xl text-primary">{pullRequests.length}</div>
        </div>
      </div>

      {/* PR List */}
      <div className="space-y-3">
        {pullRequests.slice(0, 4).map((pr) => (
          <div
            key={pr.id}
            className="p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getStateColor(pr.state)}`}>
                {getStateIcon(pr.state)}
              </div>

              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-start gap-2 mb-2">
                  <h4 className="flex-1 line-clamp-2">{pr.title}</h4>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    #{pr.number}
                  </span>
                </div>

                {/* Labels */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {pr.labels.map((label) => (
                    <span
                      key={label}
                      className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>by {pr.author}</span>
                  <span>•</span>
                  <span>{formatDate(pr.created_at)}</span>
                  {pr.reviews > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{pr.reviews} reviews</span>
                      </div>
                    </>
                  )}
                  {pr.state === 'merged' && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-purple-500">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Merged</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      {openPRs.length > 0 && (
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm">
            <span className="text-primary">💡 AI Suggestion:</span> PR #{openPRs[0].number} has
            been open for {formatDate(openPRs[0].created_at)}. Consider assigning reviewers or
            breaking it into smaller PRs for faster review cycles.
          </p>
        </div>
      )}
    </div>
  );
}
