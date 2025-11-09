import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectView } from '../views/ProjectView';
import { useTheme } from '../hooks/useTheme';
import { useUser } from '../contexts/UserContext';
import { projectService, Project as ApiProject } from '../services/projectService';
import { issueService, Issue } from '../services/issueService';
import { sprintService, Sprint } from '../services/sprintService';
import {
  handleAIPrompt,
  handleAISuggestion,
  handleApplyAIChanges,
} from '../utils/handlers';
import { BacklogItem } from '../types';
import { toast } from 'sonner';

// Map API issue to frontend BacklogItem
const mapIssueToBacklogItem = (issue: Issue): BacklogItem => {
  // Map status to progress for display
  let progress = 0;
  if (issue.status === 'done') progress = 100;
  else if (issue.status === 'in_progress') progress = 50;
  else if (issue.status === 'todo') progress = 0;
  else if (issue.status === 'backlog') progress = 0;

  return {
    id: issue._id,
    title: issue.title,
    description: issue.description,
    tags: [issue.type, issue.priority],
    priority: issue.priority as 'high' | 'medium' | 'low',
    progress,
    status: issue.status,
    sprintId: issue.sprintId,
    assignee: issue.assignee,
    storyPoints: issue.estimatedHours ? Math.ceil(issue.estimatedHours / 8) : 5,
  };
};

// Map frontend project to API format
interface FrontendProject {
  id: string;
  name: string;
  color: string;
  description?: string;
  deadline?: string;
  members?: Array<{
    userId: string;
    email: string;
    name: string;
    role: 'owner' | 'admin' | 'member';
    addedAt: string;
  }>;
  stats?: {
    stories: number;
    sprints: number;
    members: number;
  };
}

const mapApiProjectToFrontend = (project: ApiProject, index: number): FrontendProject => ({
  id: project._id,
  name: project.name,
  color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][index % 4],
  description: project.description,
  deadline: (project as any).deadline,
  members: (project as any).members || [],
  stats: project.stats,
});

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme, themeMode, handleThemeChange, handleThemeModeChange } = useTheme();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [newStoryModalOpen, setNewStoryModalOpen] = useState(false);
  const [createSprintModalOpen, setCreateSprintModalOpen] = useState(false);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<FrontendProject | null>(null);
  const [allProjects, setAllProjects] = useState<FrontendProject[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  // Load project and issues
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Listen for settings navigation from profile dropdown
  useEffect(() => {
    const handleNavigateToSettings = () => {
      setActiveTab('settings');
    };

    window.addEventListener('navigate-to-settings', handleNavigateToSettings);
    return () => window.removeEventListener('navigate-to-settings', handleNavigateToSettings);
  }, []);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // Load current project
      const projectResponse = await projectService.getProject(projectId!);
      if (projectResponse.success && projectResponse.project) {
        setSelectedProject(mapApiProjectToFrontend(projectResponse.project, 0));
      }

      // Load all projects for dropdown
      const projectsResponse = await projectService.getProjects();
      if (projectsResponse.success && projectsResponse.projects) {
        setAllProjects(projectsResponse.projects.map((p: ApiProject, i: number) => 
          mapApiProjectToFrontend(p, i)
        ));
      }

      // Load issues for this project
      const issuesResponse = await issueService.getProjectIssues(projectId!);
      if (issuesResponse.success && issuesResponse.issues) {
        setBacklogItems(issuesResponse.issues.map(mapIssueToBacklogItem));
      }

      // Load sprints for this project
      const sprintsResponse = await sprintService.getProjectSprints(projectId!);
      if (sprintsResponse.success && sprintsResponse.sprints) {
        setSprints(sprintsResponse.sprints);
      }

      // Load active sprint
      try {
        const activeSprintResponse = await sprintService.getActiveSprint(projectId!);
        if (activeSprintResponse.success && activeSprintResponse.sprint) {
          setActiveSprint(activeSprintResponse.sprint);
        }
      } catch (error) {
        // No active sprint is fine
        setActiveSprint(null);
      }
    } catch (error: any) {
      console.error('Failed to load project data:', error);
      toast.error('Failed to load project', {
        description: error.message,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const handleProjectChange = (project: FrontendProject) => {
    navigate(`/project/${project.id}`);
  };

  const handleCreateStory = async (story: any) => {
    try {
      const issueData = {
        projectId: projectId!,
        title: story.title,
        description: story.description || '',
        type: story.type || 'story',
        status: 'backlog' as const,
        priority: story.priority || 'medium',
        assignee: story.assignee,
        estimatedHours: story.estimatedHours,
        acceptanceCriteria: story.acceptanceCriteria || [],
      };

      const response = await issueService.createIssue(issueData);
      
      if (response.success && response.issue) {
        toast.success('Story created!', {
          description: `${story.title} has been added to the backlog`,
          duration: 2000,
        });
        
        // Reload issues
        await loadProjectData();
        setNewStoryModalOpen(false);
      }
    } catch (error: any) {
      console.error('Failed to create story:', error);
      toast.error('Failed to create story', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleItemMove = async (itemId: string, newStatus: string) => {
    try {
      // Ensure status is valid API status
      const apiStatus = newStatus as 'backlog' | 'todo' | 'in_progress' | 'done';

      await issueService.updateIssue(itemId, { status: apiStatus });
      
      // Update local state optimistically
      setBacklogItems(prev => prev.map(item => {
        if (item.id === itemId) {
          let progress = 0;
          if (apiStatus === 'done') progress = 100;
          else if (apiStatus === 'in_progress') progress = 50;
          
          return {
            ...item,
            status: apiStatus,
            progress,
          };
        }
        return item;
      }));

      toast.success('Story moved', {
        description: `Moved to ${newStatus.replace('_', ' ')}`,
        duration: 1500,
      });
    } catch (error: any) {
      console.error('Failed to move item:', error);
      toast.error('Failed to update story', {
        description: error.message,
        duration: 3000,
      });
      // Reload to get correct state
      await loadProjectData();
    }
  };

  const handleCreateSprint = () => {
    // For now, create a simple sprint with default values
    const sprintNumber = sprints.length + 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // 2 week sprint

    const sprintData = {
      projectId: projectId!,
      name: `Sprint ${sprintNumber}`,
      goal: 'Sprint goal',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    sprintService.createSprint(sprintData)
      .then(response => {
        if (response.success && response.sprint) {
          toast.success('Sprint created!', {
            description: `${response.sprint.name} has been created`,
            duration: 2000,
          });
          loadProjectData();
        }
      })
      .catch(error => {
        toast.error('Failed to create sprint', {
          description: error.message,
          duration: 3000,
        });
      });
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      const response = await sprintService.startSprint(sprintId);
      if (response.success) {
        toast.success('Sprint started!', {
          description: 'The sprint is now active',
          duration: 2000,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to start sprint', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      const response = await sprintService.completeSprint(sprintId);
      if (response.success) {
        toast.success('Sprint completed!', {
          description: 'Incomplete items moved back to backlog',
          duration: 2000,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to complete sprint', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleAddIssuesToSprint = async (sprintId: string, issueIds: string[]) => {
    try {
      const response = await sprintService.addIssuesToSprint(sprintId, issueIds);
      if (response.success) {
        toast.success('Issues added to sprint!', {
          description: `${issueIds.length} item(s) added`,
          duration: 2000,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to add issues', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleRemoveIssueFromSprint = async (sprintId: string, issueId: string) => {
    try {
      const response = await sprintService.removeIssueFromSprint(sprintId, issueId);
      if (response.success) {
        toast.success('Issue removed from sprint', {
          duration: 1500,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to remove issue', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleAddMember = async (email: string, role: 'admin' | 'member') => {
    try {
      const response = await projectService.addMember(projectId!, email, role);
      if (response.success) {
        toast.success('Member added!', {
          description: `${email} has been added to the project`,
          duration: 2000,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to add member', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleRemoveMember = async (email: string) => {
    try {
      const response = await projectService.removeMember(projectId!, email);
      if (response.success) {
        toast.success('Member removed', {
          duration: 1500,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to remove member', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleEditStory = async (storyId: string, updates: any) => {
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.storyPoints) {
        updateData.estimatedHours = updates.storyPoints * 8; // Convert story points to hours
      }

      const response = await issueService.updateIssue(storyId, updateData);
      if (response.success) {
        toast.success('Story updated!', {
          duration: 2000,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to update story', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleAssignStory = async (storyId: string, assignee: string) => {
    try {
      const response = await issueService.updateIssue(storyId, { assignee });
      if (response.success) {
        toast.success(assignee ? 'Story assigned!' : 'Assignment removed', {
          duration: 2000,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to assign story', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      const response = await issueService.deleteIssue(storyId);
      if (response.success) {
        toast.success('Story deleted', {
          duration: 1500,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to delete story', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleUpdateProject = async (updates: { name?: string; description?: string; deadline?: string }) => {
    try {
      const response = await projectService.updateProject(projectId!, updates);
      if (response.success) {
        toast.success('Project updated!', {
          duration: 2000,
        });
        await loadProjectData();
      }
    } catch (error: any) {
      toast.error('Failed to update project', {
        description: error.message,
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Project not found</p>
          <button
            onClick={handleBackToProjects}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectView
      activeTab={activeTab}
      aiCopilotOpen={aiCopilotOpen}
      newStoryModalOpen={newStoryModalOpen}
      theme={theme}
      themeMode={themeMode}
      backlogItems={backlogItems}
      selectedProject={selectedProject}
      projects={allProjects}
      sprints={sprints}
      activeSprint={activeSprint}
      ownerEmail={user.email}
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
      onCreateSprint={handleCreateSprint}
      onStartSprint={handleStartSprint}
      onCompleteSprint={handleCompleteSprint}
      onAddIssuesToSprint={handleAddIssuesToSprint}
      onRemoveIssueFromSprint={handleRemoveIssueFromSprint}
      onAddMember={handleAddMember}
      onRemoveMember={handleRemoveMember}
      onEditStory={handleEditStory}
      onAssignStory={handleAssignStory}
      onDeleteStory={handleDeleteStory}
      onUpdateProject={handleUpdateProject}
    />
  );
}
