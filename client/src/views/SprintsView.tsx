import { BacklogCard, BacklogItem } from '../components/BacklogCard';

interface SprintsViewProps {
  backlogItems: BacklogItem[];
}

export function SprintsView({ backlogItems }: SprintsViewProps) {
  return (
    <div className="p-8">
      <h1 className="mb-6">Sprint Planning</h1>
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="mb-4">Current Sprint (Sprint 23)</h3>
        <p className="text-muted-foreground mb-6">Nov 1 - Nov 14, 2025</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {backlogItems.slice(0, 4).map((item) => (
            <BacklogCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
