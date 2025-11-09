import { ThemeToggle } from '../components/ThemeToggle';
import { BacklogItem } from '../components/BacklogCard';
import { KanbanBoard } from '../components/KanbanBoard';
import { Plus } from 'lucide-react';

interface BoardViewProps {
  theme: string;
  backlogItems: BacklogItem[];
  onThemeChange: (theme: string) => void;
  onItemMove: (itemId: string, newStatus: string) => void;
  onNewStoryClick: () => void;
  onTabChange: (tab: string) => void;
  activeSprint?: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
  } | null;
}

export function BoardView({
  theme,
  backlogItems,
  onThemeChange,
  onItemMove,
  onNewStoryClick,
  onTabChange,
  activeSprint,
}: BoardViewProps) {
  // Filter to only show items that are NOT in backlog status (i.e., in a sprint)
  const sprintItems = backlogItems.filter(item => item.status !== 'backlog');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">
            {activeSprint ? activeSprint.name : 'Board'}
          </h1>
          <p className="text-muted-foreground">
            {activeSprint 
              ? activeSprint.goal
              : 'Visualize and manage your work with a kanban board'
            }
          </p>
        </div>
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>

      <div className="space-y-6">
        {!activeSprint ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="mb-2">No Active Sprint</h3>
            <p className="text-muted-foreground mb-6">
              Start a sprint to see your board. Go to the Sprints tab to create and activate a sprint.
            </p>
            <button
              onClick={() => onTabChange('sprints')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Sprints
            </button>
          </div>
        ) : sprintItems.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="mb-2">Sprint is Empty</h3>
            <p className="text-muted-foreground mb-6">
              Add stories from your backlog to this sprint to get started.
            </p>
            <button
              onClick={() => onTabChange('sprints')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Plan Sprint
            </button>
          </div>
        ) : (
          <KanbanBoard items={sprintItems} onItemMove={onItemMove} />
        )}
        
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 text-center border border-border">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="mb-2">AI-Powered Story Generation</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Let AI help you create detailed user stories with acceptance criteria,
              estimates, and smart prioritization
            </p>
            <button
              onClick={onNewStoryClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all duration-200"
            >
              Generate Story with AI
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="mb-2">Smart Prioritization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI analyzes business value, dependencies, and team capacity to suggest
                optimal story prioritization
              </p>
              <button
                onClick={() => onTabChange('backlog')}
                className="text-sm text-primary hover:underline"
              >
                View backlog →
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="mb-2">Sprint Planning Assistant</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI recommendations for sprint capacity, story allocation, and risk
                assessment
              </p>
              <button
                onClick={() => onTabChange('sprints')}
                className="text-sm text-primary hover:underline"
              >
                Start planning →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
