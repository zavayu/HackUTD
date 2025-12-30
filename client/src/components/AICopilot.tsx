import { useState } from 'react';
import { X, Send, Sparkles, Lightbulb, BarChart3, ArrowUpDown, CheckCircle2, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from './ui/scroll-area';
import { useGitHub } from './GitHubContext';
import { GitHubAIInsights } from './GitHubAIInsights';

import { copilotService, QuickSuggestion } from '../services/copilotService';

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptClick: (prompt: string) => void;
  onApplyChanges?: (changes: any) => void;
  projectId: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasActions?: boolean;
}

export function AICopilot({ isOpen, onClose, onPromptClick, onApplyChanges, projectId }: AICopilotProps) {
  const { isConnected, commits, pullRequests } = useGitHub();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isConnected
        ? 'Hi! I\'m your AI Copilot with GitHub integration. I can analyze your code commits, PRs, and provide data-driven sprint insights. What would you like to do?'
        : 'Hi! I\'m your AI Copilot. I can help you with sprint planning, story generation, prioritization, and insights. Connect GitHub for enhanced AI capabilities!',
    },
  ]);
  const [input, setInput] = useState('');
  const [showGitHubInsights, setShowGitHubInsights] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);

  const quickPrompts = [
    {
      icon: BarChart3,
      label: 'Summarize sprint',
      prompt: 'Summarize the current sprint progress and highlight any blockers',
    },
    {
      icon: Lightbulb,
      label: 'Generate acceptance criteria',
      prompt: 'Generate acceptance criteria for the selected user story',
    },
    {
      icon: ArrowUpDown,
      label: 'Reprioritize backlog',
      prompt: 'Analyze and suggest reprioritization for the backlog based on business value',
    },
    ...(isConnected
      ? [
        {
          icon: Github,
          label: 'Analyze GitHub activity',
          prompt: 'Analyze recent commits and PRs to suggest next sprint tasks',
        },
      ]
      : []),
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Get conversation history
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      // Call AI Copilot API
      const response = await copilotService.chat(projectId, currentInput, history);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        hasActions: response.suggestions && response.suggestions.length > 0,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Copilot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = () => {
    if (onApplyChanges) {
      onApplyChanges({
        action: 'apply-ai-suggestions',
        changes: ['reprioritize', 'move-blocked', 'break-down-story'],
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-96 h-full bg-card border-l border-border flex flex-col"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3>AI Copilot</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-accent/30 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">Quick Actions</p>
              {isConnected && (
                <button
                  onClick={() => setShowGitHubInsights(!showGitHubInsights)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  {showGitHubInsights ? 'Hide' : 'Show'} GitHub Insights
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {quickPrompts.map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={prompt.label}
                    onClick={() => {
                      onPromptClick(prompt.prompt);
                      setInput(prompt.prompt);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{prompt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            {showGitHubInsights && isConnected ? (
              <GitHubAIInsights />
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      {message.hasActions && message.role === 'assistant' && (
                        <button
                          onClick={handleApplyChanges}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Apply Changes
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-xl p-3 bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Ask AI anything..."
                disabled={loading}
                className="flex-1 px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
