import { ThemeToggle } from '../components/ThemeToggle';
import { BacklogCard, BacklogItem } from '../components/BacklogCard';
import { BacklogFilters } from '../components/BacklogFilters';
import { KanbanBoard } from '../components/KanbanBoard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { WorkspaceTabType } from '../types';

interface BacklogViewProps {
  theme: string;
  workspaceTab: WorkspaceTabType;
  backlogItems: BacklogItem[];
  onThemeChange: (theme: string) => void;
  onWorkspaceTabChange: (tab: WorkspaceTabType) => void;
  onAISuggestion: (type: string) => void;
  onItemMove: (itemId: string, newStatus: string) => void;
  onNewStoryClick: () => void;
  onTabChange: (tab: string) => void;
}

export function BacklogView({
  theme,
  workspaceTab,
  backlogItems,
  onThemeChange,
  onWorkspaceTabChange,
  onAISuggestion,
  onItemMove,
  onNewStoryClick,
  onTabChange,
}: BacklogViewProps) {
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

      <Tabs value={workspaceTab} onValueChange={onWorkspaceTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>

        <TabsContent value="backlog" className="space-y-4">
          <BacklogFilters onAISuggestion={onAISuggestion} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backlogItems.map((item, index) => (
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
        </TabsContent>

        <TabsContent value="board" className="space-y-6">
          <KanbanBoard items={backlogItems} onItemMove={onItemMove} />
          
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
                  onClick={() => onAISuggestion('prioritize')}
                  className="text-sm text-primary hover:underline"
                >
                  Try it now →
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
