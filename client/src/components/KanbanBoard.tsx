import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BacklogItem, BacklogCard } from './BacklogCard';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KanbanBoardProps {
  items: BacklogItem[];
  onItemMove: (itemId: string, newStatus: string) => void;
  onEdit?: (item: BacklogItem) => void;
  onAssign?: (item: BacklogItem) => void;
  onDelete?: (itemId: string) => void;
}

interface DraggableCardProps {
  item: BacklogItem;
  status: string;
  onEdit?: (item: BacklogItem) => void;
  onAssign?: (item: BacklogItem) => void;
  onDelete?: (itemId: string) => void;
}

interface ColumnProps {
  title: string;
  status: string;
  items: BacklogItem[];
  onDrop: (itemId: string, status: string) => void;
  onEdit?: (item: BacklogItem) => void;
  onAssign?: (item: BacklogItem) => void;
  onDelete?: (itemId: string) => void;
}

const ItemTypes = {
  CARD: 'card',
};

function DraggableCard({ item, status, onEdit, onAssign, onDelete }: DraggableCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id: item.id, status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      <BacklogCard 
        item={item}
        onEdit={onEdit}
        onAssign={onAssign}
        onDelete={onDelete}
      />
    </div>
  );
}

function Column({ title, status, items, onDrop, onEdit, onAssign, onDelete }: ColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item: { id: string; status: string }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`bg-accent/30 rounded-xl p-4 min-h-[500px] transition-all ${
        isOver ? 'ring-2 ring-primary bg-accent/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3>{title}</h3>
        <span className="text-sm text-muted-foreground bg-card px-2 py-1 rounded">
          {items.length}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <DraggableCard 
            key={item.id} 
            item={item} 
            status={status}
            onEdit={onEdit}
            onAssign={onAssign}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ items, onItemMove, onEdit, onAssign, onDelete }: KanbanBoardProps) {
  const [showAIPopup, setShowAIPopup] = useState(true);

  const columns = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'in_progress' },
    { title: 'Done', status: 'done' },
  ];

  const getItemsByStatus = (status: string) => {
    // Filter by status field, fallback to progress for backward compatibility
    return items.filter((item) => {
      if (item.status) {
        // Use status field if available
        return item.status === status;
      } else {
        // Fallback to progress-based filtering
        if (status === 'todo') {
          return item.progress === 0;
        } else if (status === 'in_progress') {
          return item.progress > 0 && item.progress < 100;
        } else {
          return item.progress === 100;
        }
      }
    });
  };

  // Check for blocked tasks (in progress > 50% for demo)
  const blockedTasks = items.filter(
    (item) => item.progress > 0 && item.progress < 100 && item.progress > 40
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        <AnimatePresence>
          {showAIPopup && blockedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="mb-1">AI Copilot Suggestion</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        These {blockedTasks.length} tasks look blocked — they've been in progress
                        for a while. Want to reassign or break them down?
                      </p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity">
                          Reassign Tasks
                        </button>
                        <button className="px-3 py-1.5 border border-border bg-card rounded-lg text-sm hover:bg-accent transition-colors">
                          Break Down Stories
                        </button>
                        <button
                          onClick={() => setShowAIPopup(false)}
                          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => (
            <Column
              key={column.status}
              title={column.title}
              status={column.status}
              items={getItemsByStatus(column.status)}
              onDrop={onItemMove}
              onEdit={onEdit}
              onAssign={onAssign}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
