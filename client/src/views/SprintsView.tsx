import { useState } from 'react';
import { BacklogCard, BacklogItem } from '../components/BacklogCard';
import { EditStoryModal } from '../components/EditStoryModal';
import { AssignMemberModal } from '../components/AssignMemberModal';
import { ThemeToggle } from '../components/ThemeToggle';
import { Plus, Play, CheckCircle, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { ProjectMember } from '../types';

interface Sprint {
  _id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  stats?: {
    totalIssues: number;
    completedIssues: number;
    completionRate: number;
  };
}

interface SprintsViewProps {
  theme: string;
  backlogItems: BacklogItem[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  members: ProjectMember[];
  ownerEmail: string;
  onThemeChange: (theme: string) => void;
  onCreateSprint: () => void;
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (sprintId: string) => void;
  onAddIssuesToSprint: (sprintId: string, issueIds: string[]) => void;
  onRemoveIssueFromSprint: (sprintId: string, issueId: string) => void;
  onEditStory: (storyId: string, updates: any) => void;
  onAssignStory: (storyId: string, assignee: string) => void;
  onDeleteStory: (storyId: string) => void;
}

export function SprintsView({ 
  theme,
  backlogItems = [], 
  sprints = [],
  activeSprint,
  members = [],
  ownerEmail,
  onThemeChange,
  onCreateSprint,
  onStartSprint,
  onCompleteSprint,
  onAddIssuesToSprint,
  onRemoveIssueFromSprint,
  onEditStory,
  onAssignStory,
  onDeleteStory,
}: SprintsViewProps) {
  const [selectedSprint, setSelectedSprint] = useState<string | null>(
    activeSprint?._id || null
  );
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [editingStory, setEditingStory] = useState<BacklogItem | null>(null);
  const [assigningStory, setAssigningStory] = useState<BacklogItem | null>(null);

  // Get backlog items (not in any sprint)
  const backlogOnlyItems = backlogItems.filter(item => item.status === 'backlog');
  
  // Get items in selected sprint only
  const sprintItems = selectedSprint 
    ? backlogItems.filter(item => item.sprintId === selectedSprint)
    : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleAddToSprint = () => {
    if (selectedSprint && selectedIssues.length > 0) {
      onAddIssuesToSprint(selectedSprint, selectedIssues);
      setSelectedIssues([]);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-2">Sprint Planning</h1>
          <p className="text-muted-foreground">
            Plan and manage your sprints
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCreateSprint}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Sprint
          </button>
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprints List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="mb-4">Sprints</h3>
          
          {sprints.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">No sprints yet</p>
              <button
                onClick={onCreateSprint}
                className="text-sm text-primary hover:underline"
              >
                Create your first sprint
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sprints.map((sprint) => (
                <motion.div
                  key={sprint._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-card border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedSprint === sprint._id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSprint(sprint._id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{sprint.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      sprint.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : sprint.status === 'completed'
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {sprint.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                  </p>
                  {sprint.stats && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {sprint.stats.completedIssues}/{sprint.stats.totalIssues} issues
                      </span>
                      <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${sprint.stats.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {sprint.status === 'planned' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartSprint(sprint._id);
                      }}
                      className="mt-3 w-full px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <Play className="w-3 h-3" />
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === 'active' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteSprint(sprint._id);
                      }}
                      className="mt-3 w-full px-3 py-1.5 border border-border bg-card rounded-lg text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Complete Sprint
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sprint Details & Planning */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSprint ? (
            <>
              {/* Sprint Items */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="mb-4">Sprint Items</h3>
                {sprintItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No items in this sprint yet. Add items from the backlog below.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sprintItems.map((item) => (
                      <BacklogCard 
                        key={item.id} 
                        item={item}
                        onEdit={(item) => setEditingStory(item)}
                        onAssign={(item) => setAssigningStory(item)}
                        onDelete={onDeleteStory}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Backlog Items to Add */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3>Add from Backlog</h3>
                  {selectedIssues.length > 0 && (
                    <button
                      onClick={handleAddToSprint}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                      Add {selectedIssues.length} to Sprint
                    </button>
                  )}
                </div>
                {backlogOnlyItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No items in backlog. Create new stories first!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {backlogOnlyItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleIssueSelection(item.id)}
                        className={`cursor-pointer transition-all ${
                          selectedIssues.includes(item.id)
                            ? 'ring-2 ring-primary rounded-lg'
                            : ''
                        }`}
                      >
                        <BacklogCard 
                          item={item}
                          onEdit={(item) => setEditingStory(item)}
                          onAssign={(item) => setAssigningStory(item)}
                          onDelete={onDeleteStory}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">Select a Sprint</h3>
              <p className="text-muted-foreground">
                Choose a sprint from the list to view and manage its items
              </p>
            </div>
          )}
        </div>
      </div>

      <EditStoryModal
        isOpen={!!editingStory}
        story={editingStory}
        onClose={() => setEditingStory(null)}
        onSave={onEditStory}
      />

      <AssignMemberModal
        isOpen={!!assigningStory}
        story={assigningStory}
        members={members}
        ownerEmail={ownerEmail}
        onClose={() => setAssigningStory(null)}
        onAssign={onAssignStory}
      />
    </div>
  );
}
