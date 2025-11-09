import { useGitHub } from './GitHubContext';
import { GitHubMetrics } from './GitHubMetrics';
import { GitHubCommitFeed } from './GitHubCommitFeed';
import { GitHubPRTracker } from './GitHubPRTracker';

export function GitHubDashboardSection() {
  const { isConnected } = useGitHub();

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <div className="mt-6">
        <GitHubMetrics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GitHubCommitFeed />
        <GitHubPRTracker />
      </div>
    </>
  );
}
