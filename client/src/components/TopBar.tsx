import { useState } from 'react';
import { Search, Sparkles, Github, CheckCircle2 } from 'lucide-react';
import { useGitHub } from './GitHubContext';
import { GitHubConnectionModal } from './GitHubConnectionModal';
import { ProfileDropdown } from './ProfileDropdown';

interface TopBarProps {
  onAICopilotToggle: () => void;
  aiCopilotOpen: boolean;
  projectId?: string;
}

export function TopBar({ onAICopilotToggle, aiCopilotOpen, projectId }: TopBarProps) {
  const { isConnected, selectedRepo, disconnectGitHub } = useGitHub();
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  return (
    <>
      <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks, stories, epics..."
              className="w-full pl-10 pr-4 py-2 bg-accent/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4">
          {/* GitHub Connection Button */}
          {isConnected && selectedRepo ? (
            <div className="relative group">
              <button
                onClick={() => setShowGitHubModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm max-w-[150px] truncate">{selectedRepo.name}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <p className="text-sm mb-2">
                  <span className="text-green-500">● Connected</span> to {selectedRepo.full_name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnectGitHub();
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowGitHubModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 border border-border rounded-lg transition-all"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">Connect GitHub</span>
            </button>
          )}

          <button
            onClick={onAICopilotToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              aiCopilotOpen
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Ask AI Copilot</span>
          </button>
          <ProfileDropdown />
        </div>
      </div>

      {projectId && (
        <GitHubConnectionModal 
          isOpen={showGitHubModal} 
          onClose={() => setShowGitHubModal(false)} 
          projectId={projectId}
        />
      )}
    </>
  );
}
