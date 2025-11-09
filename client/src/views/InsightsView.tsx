import { AIInsightsView } from '../components/AIInsightsView';

interface InsightsViewProps {
  projectId: string;
}

export function InsightsView({ projectId }: InsightsViewProps) {
  return (
    <div className="p-8">
      <AIInsightsView projectId={projectId} />
    </div>
  );
}
