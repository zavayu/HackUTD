import { useState } from 'react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MoreVertical, User, Edit, UserPlus, Trash2 } from 'lucide-react';

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  sprintId?: string;
  assignee?: string;
  storyPoints?: number;
}

interface BacklogCardProps {
  item: BacklogItem;
  onClick?: () => void;
  onEdit?: (item: BacklogItem) => void;
  onAssign?: (item: BacklogItem) => void;
  onDelete?: (itemId: string) => void;
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
  medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  low: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

export function BacklogCard({ item, onClick, onEdit, onAssign, onDelete }: BacklogCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group relative"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-card border border-border rounded-lg shadow-lg py-1">
                <button
                  onClick={(e) => handleMenuClick(e, () => onEdit?.(item))}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Story
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, () => onAssign?.(item))}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign to Member
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, () => onDelete?.(item.id))}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Story
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={priorityColors[item.priority]}>
          {item.priority}
        </Badge>
        {item.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
        {item.storyPoints && (
          <Badge variant="outline" className="text-xs">
            {item.storyPoints} pts
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{item.progress}%</span>
        </div>
        <Progress value={item.progress} className="h-1.5" />
      </div>
      
      {item.assignee && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-muted-foreground">{item.assignee}</span>
        </div>
      )}
    </div>
  );
}
