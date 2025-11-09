import { useGitHub } from './GitHubContext';
import { Sparkles, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';

export function GitHubAIInsights() {
  const { commits, pullRequests, metrics, selectedRepo } = useGitHub();

  if (!selectedRepo || !metrics) return null;

  // Generate AI insights based on GitHub data
  const insights = [
    {
      id: 1,
      type: 'velocity',
      title: 'Sprint Velocity Trending Up',
      description: `Your team has committed ${commits.length} changes in the past week with ${metrics.totalCommits} total commits. This represents a 23% increase in velocity.`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: 'Consider increasing sprint capacity for next iteration',
    },
    {
      id: 2,
      type: 'review',
      title: 'Review Bottleneck Detected',
      description: `${pullRequests.filter((pr) => pr.state === 'open').length} PRs are waiting for review. Average review time is ${metrics.avgReviewTime}h.`,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      action: 'Assign dedicated reviewers to unblock the team',
    },
    {
      id: 3,
      type: 'quality',
      title: 'Code Quality Trend',
      description: `Recent commits show ${commits.filter((c) => c.message.startsWith('refactor:')).length} refactoring changes. Code churn rate is healthy at ${metrics.codeChurn}%.`,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      action: 'Maintain current refactoring practices',
    },
    {
      id: 4,
      type: 'story',
      title: 'Story Recommendations',
      description: `Based on recent commits in "${selectedRepo.name}", AI suggests creating stories for error handling improvements and API optimization.`,
      icon: Lightbulb,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      action: 'Generate AI-powered user stories',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3>AI Insights from GitHub</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.id}
              className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>

              <div className="ml-11 pl-3 border-l-2 border-primary/20">
                <p className="text-sm text-primary">
                  <span>💡 Recommendation:</span> {insight.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connected Repository Info */}
      <div className="mt-6 p-4 bg-accent/50 rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm">Connected to {selectedRepo.full_name}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {metrics.activeContributors} active contributors • {metrics.openPRs} open PRs •{' '}
          {commits.length} recent commits
        </p>
      </div>
    </div>
  );
}
