import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Sparkles, Wand2, CheckCircle2, FileText, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';

interface NewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (story: any) => void;
}

export function NewStoryModal({ isOpen, onClose, onCreateStory }: NewStoryModalProps) {
  const [mode, setMode] = useState<'choice' | 'ai' | 'manual'>('choice');
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [userInput, setUserInput] = useState('');
  const [generatedStory, setGeneratedStory] = useState<any>(null);
  
  // Manual form state
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    type: 'story' as 'story' | 'task' | 'bug',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    assignee: '',
    estimatedHours: '',
    acceptanceCriteria: [''],
    tags: [] as string[],
  });

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
    setMode('choice');
    setStep('input');
    setUserInput('');
    setGeneratedStory(null);
    setManualForm({
      title: '',
      description: '',
      type: 'story',
      priority: 'medium',
      assignee: '',
      estimatedHours: '',
      acceptanceCriteria: [''],
      tags: [],
    });
  };

  const handleManualCreate = () => {
    const story = {
      title: manualForm.title,
      description: manualForm.description,
      type: manualForm.type,
      priority: manualForm.priority,
      assignee: manualForm.assignee || undefined,
      estimatedHours: manualForm.estimatedHours ? parseInt(manualForm.estimatedHours) : undefined,
      acceptanceCriteria: manualForm.acceptanceCriteria.filter(c => c.trim()),
      tags: manualForm.tags,
      progress: 0,
      storyPoints: Math.ceil((parseInt(manualForm.estimatedHours) || 8) / 8), // Rough estimate
    };
    onCreateStory(story);
    onClose();
    resetModal();
  };

  const addAcceptanceCriteria = () => {
    setManualForm({
      ...manualForm,
      acceptanceCriteria: [...manualForm.acceptanceCriteria, ''],
    });
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    const updated = [...manualForm.acceptanceCriteria];
    updated[index] = value;
    setManualForm({ ...manualForm, acceptanceCriteria: updated });
  };

  const removeAcceptanceCriteria = (index: number) => {
    setManualForm({
      ...manualForm,
      acceptanceCriteria: manualForm.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (onClose(), resetModal())}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'choice' && 'Create New Story'}
            {mode === 'ai' && (
              <>
                <Sparkles className="w-5 h-5 text-primary" />
                AI Story Generator
              </>
            )}
            {mode === 'manual' && (
              <>
                <FileText className="w-5 h-5 text-primary" />
                Manual Story Creation
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {mode === 'choice' && (
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => setMode('ai')}
              className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">AI Generated</h3>
              <p className="text-sm text-muted-foreground">
                Let AI create a detailed story from your description
              </p>
            </button>

            <button
              onClick={() => setMode('manual')}
              className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-accent/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Manual Entry</h3>
              <p className="text-sm text-muted-foreground">
                Fill out the form yourself with full control
              </p>
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                placeholder="User authentication with SSO"
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={manualForm.description}
                onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                placeholder="As a user, I want to..."
                className="w-full h-24 px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="story">Story</option>
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={manualForm.priority}
                  onChange={(e) => setManualForm({ ...manualForm, priority: e.target.value as any })}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Assignee</label>
                <input
                  type="text"
                  value={manualForm.assignee}
                  onChange={(e) => setManualForm({ ...manualForm, assignee: e.target.value })}
                  placeholder="Sarah Chen"
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                <input
                  type="number"
                  value={manualForm.estimatedHours}
                  onChange={(e) => setManualForm({ ...manualForm, estimatedHours: e.target.value })}
                  placeholder="8"
                  min="0"
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Acceptance Criteria</label>
              <div className="space-y-2">
                {manualForm.acceptanceCriteria.map((criteria, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={criteria}
                      onChange={(e) => updateAcceptanceCriteria(index, e.target.value)}
                      placeholder="Users can login with Google"
                      className="flex-1 px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {manualForm.acceptanceCriteria.length > 1 && (
                      <button
                        onClick={() => removeAcceptanceCriteria(index)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addAcceptanceCriteria}
                  className="w-full px-4 py-2 border border-dashed border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground"
                >
                  <Plus className="w-4 h-4" />
                  Add Criteria
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setMode('choice')}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleManualCreate}
                disabled={!manualForm.title.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Create Story
              </button>
            </div>
          </div>
        )}

        {mode === 'ai' && step === 'input' && (
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
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setMode('choice')}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Back
              </button>
              <div className="flex gap-2">
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
          </div>
        )}

        {mode === 'ai' && step === 'generating' && (
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

        {mode === 'ai' && step === 'preview' && generatedStory && (
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
