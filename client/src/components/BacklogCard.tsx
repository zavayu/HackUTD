import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MoreVertical, User } from 'lucide-react';

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  assignee?: string;
  storyPoints?: number;
}

interface BacklogCardProps {
  item: BacklogItem;
  onClick?: () => void;
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
  medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  low: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

export function BacklogCard({ item, onClick }: BacklogCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded">
          <MoreVertical className="w-4 h-4" />
        </button>
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
