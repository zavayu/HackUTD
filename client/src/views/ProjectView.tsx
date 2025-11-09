import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { AICopilot } from '../components/AICopilot';
import { NewStoryModal } from '../components/NewStoryModal';
import { DashboardView } from './DashboardView';
import { BacklogView } from './BacklogView';
import { BoardView } from './BoardView';
import { SprintsView } from './SprintsView';
import { InsightsView } from './InsightsView';
import { SettingsView } from './SettingsView';
import { Plus } from 'lucide-react';
import { Project, BacklogItem, TabType } from '../types';

interface Sprint {
  _id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  stats?: {
    totalIssues: number;
    completedIssues: number;
    completionRate: number;
  };
}

interface ProjectViewProps {
  activeTab: string;
  aiCopilotOpen: boolean;
  newStoryModalOpen: boolean;
  theme: string;
  themeMode: 'light' | 'dark' | 'system';
  backlogItems: BacklogItem[];
  selectedProject: Project;
  projects: Project[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  ownerEmail: string;
  onTabChange: (tab: string) => void;
  onAICopilotToggle: () => void;
  onNewStoryModalToggle: () => void;
  onThemeChange: (theme: string) => void;
  onThemeModeChange: (mode: 'light' | 'dark' | 'system') => void;
  onProjectChange: (project: Project) => void;
  onBackToProjects: () => void;
  onCreateStory: (story: any) => void;
  onAIPrompt: (prompt: string) => void;
  onApplyAIChanges: (changes: any) => void;
  onAISuggestion: (type: string) => void;
  onItemMove: (itemId: string, newStatus: string) => void;
  onCreateSprint: () => void;
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (sprintId: string) => void;
  onAddIssuesToSprint: (sprintId: string, issueIds: string[]) => void;
  onRemoveIssueFromSprint: (sprintId: string, issueId: string) => void;
  onAddMember: (email: string, role: 'admin' | 'member') => void;
  onRemoveMember: (email: string) => void;
  onEditStory: (storyId: string, updates: any) => void;
  onAssignStory: (storyId: string, assignee: string) => void;
  onDeleteStory: (storyId: string) => void;
}

export function ProjectView({
  activeTab,
  aiCopilotOpen,
  newStoryModalOpen,
  theme,
  themeMode,
  backlogItems,
  selectedProject,
  projects,
  sprints,
  activeSprint,
  ownerEmail,
  onTabChange,
  onAICopilotToggle,
  onNewStoryModalToggle,
  onThemeChange,
  onThemeModeChange,
  onProjectChange,
  onBackToProjects,
  onCreateStory,
  onAIPrompt,
  onApplyAIChanges,
  onAISuggestion,
  onItemMove,
  onCreateSprint,
  onStartSprint,
  onCompleteSprint,
  onAddIssuesToSprint,
  onRemoveIssueFromSprint,
  onAddMember,
  onRemoveMember,
  onEditStory,
  onAssignStory,
  onDeleteStory,
}: ProjectViewProps) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange}
        currentProject={selectedProject}
        projects={projects}
        onProjectChange={onProjectChange}
        onBackToProjects={onBackToProjects}
      />
      
      <div className="flex-1 flex flex-col">
        <TopBar
          onAICopilotToggle={onAICopilotToggle}
          aiCopilotOpen={aiCopilotOpen}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                selectedProject={selectedProject}
                projects={projects}
                theme={theme}
                ownerEmail={ownerEmail}
                onProjectChange={onProjectChange}
                onThemeChange={onThemeChange}
                onTabChange={onTabChange}
                onNewStoryClick={onNewStoryModalToggle}
                onAddMember={onAddMember}
                onRemoveMember={onRemoveMember}
              />
            )}

            {activeTab === 'backlog' && (
              <BacklogView
                theme={theme}
                backlogItems={backlogItems}
                members={selectedProject.members || []}
                ownerEmail={ownerEmail}
                onThemeChange={onThemeChange}
                onAISuggestion={onAISuggestion}
                onEditStory={onEditStory}
                onAssignStory={onAssignStory}
                onDeleteStory={onDeleteStory}
              />
            )}

            {activeTab === 'board' && (
              <BoardView
                theme={theme}
                backlogItems={backlogItems}
                members={selectedProject.members || []}
                ownerEmail={ownerEmail}
                onThemeChange={onThemeChange}
                onItemMove={onItemMove}
                onNewStoryClick={onNewStoryModalToggle}
                onTabChange={onTabChange}
                onEditStory={onEditStory}
                onAssignStory={onAssignStory}
                onDeleteStory={onDeleteStory}
                activeSprint={activeSprint}
              />
            )}

            {activeTab === 'sprints' && (
              <SprintsView 
                theme={theme}
                backlogItems={backlogItems}
                sprints={sprints}
                activeSprint={activeSprint}
                members={selectedProject.members || []}
                ownerEmail={ownerEmail}
                onThemeChange={onThemeChange}
                onCreateSprint={onCreateSprint}
                onStartSprint={onStartSprint}
                onCompleteSprint={onCompleteSprint}
                onAddIssuesToSprint={onAddIssuesToSprint}
                onRemoveIssueFromSprint={onRemoveIssueFromSprint}
                onEditStory={onEditStory}
                onAssignStory={onAssignStory}
                onDeleteStory={onDeleteStory}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsView />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                currentTheme={theme}
                currentMode={themeMode}
                onThemeChange={onThemeChange}
                onModeChange={onThemeModeChange}
              />
            )}
          </div>

          <AICopilot
            isOpen={aiCopilotOpen}
            onClose={() => onAICopilotToggle()}
            onPromptClick={onAIPrompt}
            onApplyChanges={onApplyAIChanges}
          />
        </div>
      </div>

      <NewStoryModal
        isOpen={newStoryModalOpen}
        onClose={onNewStoryModalToggle}
        onCreateStory={onCreateStory}
      />

      <button
        onClick={onNewStoryModalToggle}
        className="fixed bottom-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        style={{ right: aiCopilotOpen ? '25rem' : '2rem' }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
