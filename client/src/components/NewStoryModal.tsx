import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Sparkles, Wand2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface NewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (story: any) => void;
}

export function NewStoryModal({ isOpen, onClose, onCreateStory }: NewStoryModalProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [userInput, setUserInput] = useState('');
  const [generatedStory, setGeneratedStory] = useState<any>(null);

  const handleGenerate = () => {
    setStep('generating');
    
    // Simulate AI generation
    setTimeout(() => {
      const story = {
        title: `Implement ${userInput}`,
        description: `As a user, I want to ${userInput.toLowerCase()} so that I can improve my workflow efficiency.`,
        acceptanceCriteria: [
          'User can access the feature from the main dashboard',
          'Feature includes proper error handling',
          'All interactions are logged for analytics',
        ],
        tags: ['feature', 'ai-generated'],
        priority: 'medium' as const,
        storyPoints: 5,
        progress: 0,
      };
      setGeneratedStory(story);
      setStep('preview');
    }, 2000);
  };

  const handleCreate = () => {
    if (generatedStory) {
      onCreateStory(generatedStory);
      onClose();
      resetModal();
    }
  };

  const resetModal = () => {
    setStep('input');
    setUserInput('');
    setGeneratedStory(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (onClose(), resetModal())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Story Generator
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">What feature do you want to create?</label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="E.g., Add user authentication with Google OAuth"
                className="w-full h-32 px-4 py-3 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 Pro tip: Be specific about the user value and context for better AI-generated stories
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!userInput.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Generate with AI
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="py-12 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <p className="text-muted-foreground">AI is crafting your user story...</p>
          </div>
        )}

        {step === 'preview' && generatedStory && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={generatedStory.title}
                  onChange={(e) => setGeneratedStory({ ...generatedStory, title: e.target.value })}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Description</label>
                <textarea
                  value={generatedStory.description}
                  onChange={(e) => setGeneratedStory({ ...generatedStory, description: e.target.value })}
                  className="w-full h-24 px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Acceptance Criteria</label>
                <div className="space-y-2">
                  {generatedStory.acceptanceCriteria.map((criteria: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-yellow-500/10 text-yellow-600">
                  {generatedStory.priority}
                </Badge>
                <Badge variant="outline">
                  {generatedStory.storyPoints} pts
                </Badge>
                {generatedStory.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStep('input')}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Create Story
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
