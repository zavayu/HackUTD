import { ThemeToggle } from '../components/ThemeToggle';
import { BacklogCard, BacklogItem } from '../components/BacklogCard';
import { BacklogFilters } from '../components/BacklogFilters';
import { motion } from 'motion/react';

interface BacklogViewProps {
  theme: string;
  backlogItems: BacklogItem[];
  onThemeChange: (theme: string) => void;
  onAISuggestion: (type: string) => void;
}

export function BacklogView({
  theme,
  backlogItems,
  onThemeChange,
  onAISuggestion,
}: BacklogViewProps) {
  // Filter to only show items in backlog status (not assigned to any sprint)
  const backlogOnlyItems = backlogItems.filter(item => item.status === 'backlog');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">Product Backlog</h1>
          <p className="text-muted-foreground">
            Manage and prioritize your product stories with AI assistance
          </p>
        </div>
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>

      <div className="space-y-4">
        <BacklogFilters onAISuggestion={onAISuggestion} />
        {backlogOnlyItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items in backlog. Create a new story to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backlogOnlyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <BacklogCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
