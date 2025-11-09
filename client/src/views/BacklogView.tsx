import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BacklogCard, BacklogItem } from '../components/BacklogCard';
import { BacklogFilters } from '../components/BacklogFilters';
import { EditStoryModal } from '../components/EditStoryModal';
import { AssignMemberModal } from '../components/AssignMemberModal';
import { motion } from 'motion/react';
import { ProjectMember } from '../types';

interface BacklogViewProps {
  theme: string;
  backlogItems: BacklogItem[];
  members: ProjectMember[];
  ownerEmail: string;
  onThemeChange: (theme: string) => void;
  onAISuggestion: (type: string) => void;
  onEditStory: (storyId: string, updates: Partial<BacklogItem>) => void;
  onAssignStory: (storyId: string, assignee: string) => void;
  onDeleteStory: (storyId: string) => void;
}

export function BacklogView({
  theme,
  backlogItems,
  members,
  ownerEmail,
  onThemeChange,
  onAISuggestion,
  onEditStory,
  onAssignStory,
  onDeleteStory,
}: BacklogViewProps) {
  const [editingStory, setEditingStory] = useState<BacklogItem | null>(null);
  const [assigningStory, setAssigningStory] = useState<BacklogItem | null>(null);

  const handleEdit = (item: BacklogItem) => {
    console.log('Edit clicked:', item);
    setEditingStory(item);
  };

  const handleAssign = (item: BacklogItem) => {
    console.log('Assign clicked:', item);
    setAssigningStory(item);
  };

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
                <BacklogCard 
                  item={item}
                  onEdit={handleEdit}
                  onAssign={handleAssign}
                  onDelete={onDeleteStory}
                />
              </motion.div>
            ))}
          </div>
        )}
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
