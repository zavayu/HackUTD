import { useState } from 'react';
import { GitHubProvider } from './components/GitHubContext';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { ProjectView } from './views/ProjectView';
import { Toaster, toast } from 'sonner';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { initialBacklogItems, projects } from './constants/data';
import { createStoryHandler, itemMoveHandler, handleAIPrompt, handleAISuggestion, handleApplyAIChanges } from './utils/handlers';
import { ViewType, WorkspaceTabType, BacklogItem } from './types';

export default function App() {
  const { isLoggedIn, login } = useAuth();
  const { theme, themeMode, handleThemeChange, handleThemeModeChange } = useTheme();

  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabType>('backlog');
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [newStoryModalOpen, setNewStoryModalOpen] = useState(false);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(initialBacklogItems);
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  const handleLogin = () => {
    login();
    setCurrentView('projects');
    toast.success('Welcome back!', {
      description: 'Successfully logged in',
      duration: 2000,
    });
  };

  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const handleSelectProject = (project: typeof projects[0]) => {
    setSelectedProject(project);
    setCurrentView('project');
    setActiveTab('dashboard');
    toast.success(`Switched to ${project.name}`, {
      duration: 2000,
    });
  };

  const handleBackToProjects = () => {
    if (isLoggedIn) {
      setCurrentView('projects');
    } else {
      setCurrentView('home');
    }
  };

  const handleCreateProject = () => {
    toast.info('Create project', {
      description: 'Project creation coming soon!',
      duration: 2000,
    });
  };

  const handleCreateStory = (story: any) => {
    createStoryHandler(story, backlogItems, setBacklogItems);
  };

  const handleItemMove = (itemId: string, newStatus: string) => {
    itemMoveHandler(itemId, newStatus, setBacklogItems);
  };

  if (currentView === 'home') {
    return (
      <GitHubProvider>
        <div className="bg-background text-foreground">
          <Toaster richColors position="top-right" />
          <HomePage onGetStarted={handleGetStarted} />
        </div>
      </GitHubProvider>
    );
  }

  if (currentView === 'login') {
    return (
      <GitHubProvider>
        <div className="bg-background text-foreground">
          <Toaster richColors position="top-right" />
          <LoginPage onLogin={handleLogin} />
        </div>
      </GitHubProvider>
    );
  }

  if (currentView === 'projects') {
    return (
      <GitHubProvider>
        <div className="bg-background text-foreground">
          <Toaster richColors position="top-right" />
          <LandingPage
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
          />
        </div>
      </GitHubProvider>
    );
  }

  return (
    <GitHubProvider>
      <Toaster richColors position="top-right" />
      <ProjectView
        activeTab={activeTab}
        workspaceTab={workspaceTab}
        aiCopilotOpen={aiCopilotOpen}
        newStoryModalOpen={newStoryModalOpen}
        theme={theme}
        themeMode={themeMode}
        backlogItems={backlogItems}
        selectedProject={selectedProject}
        projects={projects}
        onTabChange={setActiveTab}
        onWorkspaceTabChange={setWorkspaceTab}
        onAICopilotToggle={() => setAiCopilotOpen(!aiCopilotOpen)}
        onNewStoryModalToggle={() => setNewStoryModalOpen(!newStoryModalOpen)}
        onThemeChange={handleThemeChange}
        onThemeModeChange={handleThemeModeChange}
        onProjectChange={setSelectedProject}
        onBackToProjects={handleBackToProjects}
        onCreateStory={handleCreateStory}
        onAIPrompt={handleAIPrompt}
        onApplyAIChanges={handleApplyAIChanges}
        onAISuggestion={handleAISuggestion}
        onItemMove={handleItemMove}
      />
    </GitHubProvider>
  );
}
