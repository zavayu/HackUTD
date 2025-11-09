import { useState } from 'react';
import { X, Send, Sparkles, Lightbulb, BarChart3, ArrowUpDown, CheckCircle2, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from './ui/scroll-area';
import { useGitHub } from './GitHubContext';
import { GitHubAIInsights } from './GitHubAIInsights';

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptClick: (prompt: string) => void;
  onApplyChanges?: (changes: any) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasActions?: boolean;
}

export function AICopilot({ isOpen, onClose, onPromptClick, onApplyChanges }: AICopilotProps) {
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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // Simulate AI response with GitHub context
    setTimeout(() => {
      let responseContent = `I've analyzed your request: "${currentInput}". Here are my recommendations:\n\n`;

      if (isConnected && currentInput.toLowerCase().includes('github')) {
        responseContent += `Based on ${commits.length} recent commits and ${pullRequests.filter((pr) => pr.state === 'open').length} open PRs:\n\n`;
        responseContent += `• ${commits.filter((c) => c.message.startsWith('feat:')).length} new features in progress\n`;
        responseContent += `• ${commits.filter((c) => c.message.startsWith('fix:')).length} bug fixes completed\n`;
        responseContent += `• Consider creating stories for the ${pullRequests.filter((pr) => pr.state === 'open').length} pending PRs\n`;
        responseContent += `• High commit velocity detected - team is performing well\n\n`;
      } else {
        responseContent += `• Reprioritize 3 high-value stories to the top\n`;
        responseContent += `• Move 2 blocked tasks to review\n`;
        responseContent += `• Suggest breaking down 1 large story into smaller chunks\n\n`;
      }

      responseContent += `Would you like me to apply these changes to your backlog?`;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        hasActions: true,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 800);
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

          <div className="p-4 bg-accent/30 border-b border-border">
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
            <div className="space-y-2">
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

          <ScrollArea className="flex-1 p-4">
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
                      className={`max-w-[85%] rounded-xl p-3 ${
                        message.role === 'user'
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
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AI anything..."
                className="flex-1 px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
