import { useGitHub } from './GitHubContext';
import { GitCommit, GitPullRequest, Clock, TrendingUp, Users, Activity } from 'lucide-react';

export function GitHubMetrics() {
  const { metrics } = useGitHub();

  if (!metrics) return null;

  const metricItems = [
    {
      label: 'Total Commits',
      value: metrics.totalCommits.toLocaleString(),
      icon: GitCommit,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Merged PRs',
      value: metrics.mergedPRs,
      icon: GitPullRequest,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Avg Review Time',
      value: `${metrics.avgReviewTime}h`,
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Active Contributors',
      value: metrics.activeContributors,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Engineering Metrics</h3>
          <p className="text-sm text-muted-foreground">Real-time insights from GitHub</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm">
          <Activity className="w-4 h-4" />
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-accent/30 rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl">{item.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Code Churn Indicator */}
      <div className="mt-4 p-4 bg-accent/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Code Churn Rate</span>
          <span className="text-sm">
            <TrendingUp className="w-4 h-4 inline mr-1 text-green-500" />
            {metrics.codeChurn}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${metrics.codeChurn}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Healthy churn rate indicates balanced refactoring and new development
        </p>
      </div>

      {/* Open PRs Summary */}
      <div className="mt-4 p-4 border border-primary/20 bg-primary/5 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm mb-1">
              <span className="text-primary">🚀 {metrics.openPRs} Pull Requests</span> awaiting
              review
            </p>
            <p className="text-xs text-muted-foreground">
              Average review time is {metrics.avgReviewTime} hours - faster than industry
              average
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
