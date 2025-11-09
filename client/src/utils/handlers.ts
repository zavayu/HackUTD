import { toast } from 'sonner';
import { BacklogItem } from '../types';

export const handleAIPrompt = (prompt: string) => {
  toast.info('AI is processing your request...', {
    description: prompt,
    duration: 2000,
  });
};

export const handleAISuggestion = (type: string) => {
  const messages: Record<string, string> = {
    'acceptance-criteria': 'Generating acceptance criteria for selected stories...',
    'summarize': 'Summarizing user feedback...',
    'prioritize': 'Analyzing backlog for smart prioritization...',
    'estimate': 'Estimating story points based on complexity...',
  };
  
  toast.info('AI Suggestion', {
    description: messages[type] || 'Processing AI suggestion...',
    duration: 2000,
  });
};

export const handleApplyAIChanges = (changes: any) => {
  toast.success('AI changes applied!', {
    description: 'Your backlog has been updated based on AI recommendations',
    duration: 3000,
  });
};

export const createStoryHandler = (
  story: any,
  backlogItems: BacklogItem[],
  setBacklogItems: (items: BacklogItem[]) => void
) => {
  const newStory: BacklogItem = {
    id: Date.now().toString(),
    ...story,
  };
  setBacklogItems([newStory, ...backlogItems]);
  
  toast.success('Story created successfully!', {
    description: `AI created: ${story.title}`,
    duration: 3000,
  });
};

export const itemMoveHandler = (
  itemId: string,
  newStatus: string,
  setBacklogItems: (updater: (items: BacklogItem[]) => BacklogItem[]) => void
) => {
  setBacklogItems((items) =>
    items.map((item) => {
      if (item.id === itemId) {
        let newProgress = item.progress;
        if (newStatus === 'todo') newProgress = 0;
        else if (newStatus === 'in-progress') newProgress = Math.max(1, Math.min(99, item.progress));
        else if (newStatus === 'done') newProgress = 100;
        
        return { ...item, progress: newProgress };
      }
      return item;
    })
  );
  
  toast.success('Task moved successfully', {
    duration: 1500,
  });
};
