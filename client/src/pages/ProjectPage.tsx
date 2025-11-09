import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectView } from '../views/ProjectView';
import { useTheme } from '../hooks/useTheme';
import { initialBacklogItems, projects } from '../constants/data';
import {
  createStoryHandler,
  itemMoveHandler,
  handleAIPrompt,
  handleAISuggestion,
  handleApplyAIChanges,
} from '../utils/handlers';
import { BacklogItem } from '../types';

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme, themeMode, handleThemeChange, handleThemeModeChange } = useTheme();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [newStoryModalOpen, setNewStoryModalOpen] = useState(false);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(initialBacklogItems);

  // Listen for settings navigation from profile dropdown
  useEffect(() => {
    const handleNavigateToSettings = () => {
      setActiveTab('settings');
    };

    window.addEventListener('navigate-to-settings', handleNavigateToSettings);
    return () => window.removeEventListener('navigate-to-settings', handleNavigateToSettings);
  }, []);

  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleProjectChange = (project: typeof projects[0]) => {
    navigate(`/project/${project.id}`);
  };

  const handleCreateStory = (story: any) => {
    createStoryHandler(story, backlogItems, setBacklogItems);
  };

  const handleItemMove = (itemId: string, newStatus: string) => {
    itemMoveHandler(itemId, newStatus, setBacklogItems);
  };

  return (
    <ProjectView
      activeTab={activeTab}
      aiCopilotOpen={aiCopilotOpen}
      newStoryModalOpen={newStoryModalOpen}
      theme={theme}
      themeMode={themeMode}
      backlogItems={backlogItems}
      selectedProject={selectedProject}
      projects={projects}
      onTabChange={setActiveTab}
      onAICopilotToggle={() => setAiCopilotOpen(!aiCopilotOpen)}
      onNewStoryModalToggle={() => setNewStoryModalOpen(!newStoryModalOpen)}
      onThemeChange={handleThemeChange}
      onThemeModeChange={handleThemeModeChange}
      onProjectChange={handleProjectChange}
      onBackToProjects={handleBackToProjects}
      onCreateStory={handleCreateStory}
      onAIPrompt={handleAIPrompt}
      onApplyAIChanges={handleApplyAIChanges}
      onAISuggestion={handleAISuggestion}
      onItemMove={handleItemMove}
    />
  );
}
