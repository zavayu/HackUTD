import { useState } from 'react';
import { ProjectSelector } from '../components/ProjectSelector';
import { ThemeToggle } from '../components/ThemeToggle';
import { QuickStats } from '../components/QuickStats';
import { DashboardKPIs } from '../components/DashboardKPIs';
import { AISummaryPanel } from '../components/AISummaryPanel';
import { SprintBurndown } from '../components/SprintBurndown';
import { SprintOverview } from '../components/SprintOverview';
import { RecentActivity } from '../components/RecentActivity';
import { GitHubDashboardSection } from '../components/GitHubDashboardSection';
import { TeamMembersModal } from '../components/TeamMembersModal';
import { Play, ListPlus, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '../types';

interface Sprint {
  _id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'planned' | 'active' | 'completed';
  stats?: {
    totalIssues: number;
    completedIssues: number;
    completionRate: number;
  };
}

interface BacklogItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  progress: number;
  status: 'backlog' | 'todo' | 'in_progress' | 'done';
  sprintId?: string;
  assignee?: string;
  storyPoints?: number;
}

interface DashboardViewProps {
  selectedProject: Project;
  projects: Project[];
  theme: string;
  ownerEmail: string;
  backlogItems: BacklogItem[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  onProjectChange: (project: Project) => void;
  onThemeChange: (theme: string) => void;
  onTabChange: (tab: string) => void;
  onNewStoryClick: () => void;
  onAddMember: (email: string, role: 'admin' | 'member') => void;
  onRemoveMember: (email: string) => void;
}

export function DashboardView({
  selectedProject,
  projects,
  theme,
  ownerEmail,
  backlogItems,
  sprints,
  activeSprint,
  onProjectChange,
  onThemeChange,
  onTabChange,
  onNewStoryClick,
  onAddMember,
  onRemoveMember,
}: DashboardViewProps) {
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  // Calculate real stats
  const totalStories = backlogItems.length;
  const completedStories = backlogItems.filter(item => item.status === 'done').length;
  const inProgressStories = backlogItems.filter(item => item.status === 'in_progress').length;
  const todoStories = backlogItems.filter(item => item.status === 'todo').length;
  const backlogOnlyStories = backlogItems.filter(item => item.status === 'backlog').length;
  
  // Calculate velocity (story points completed in last sprint)
  const completedSprints = sprints.filter(s => s.status === 'completed');
  const lastCompletedSprint = completedSprints.length > 0 ? completedSprints[0] : null;
  const lastSprintVelocity = lastCompletedSprint?.stats?.completedIssues || 0;
  
  // Calculate active sprint progress
  const activeSprintProgress = activeSprint?.stats?.completionRate || 0;
  const activeSprintGoal = activeSprint ? `${activeSprintProgress}%` : 'No active sprint';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <ProjectSelector
          selectedProject={selectedProject}
          projects={projects}
          onProjectChange={onProjectChange}
        />
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>

      <div className="mb-6">
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of {selectedProject.name} project health and progress
        </p>
      </div>

      <QuickStats 
        project={selectedProject}
        totalStories={totalStories}
        completedStories={completedStories}
        velocity={lastSprintVelocity}
        sprintProgress={activeSprintProgress}
        activeSprint={activeSprint}
        onManageTeam={() => setTeamModalOpen(true)}
      />
      
      <TeamMembersModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        members={selectedProject.members || []}
        ownerEmail={ownerEmail}
        onAddMember={onAddMember}
        onRemoveMember={onRemoveMember}
      />
      <DashboardKPIs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <AISummaryPanel />
        </div>
        <div className="space-y-4">
          <button
            onClick={() => {
              onTabChange('sprints');
              toast.info('Starting new sprint...');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Play className="w-5 h-5" />
            Start Sprint
          </button>
          <button
            onClick={onNewStoryClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <ListPlus className="w-5 h-5" />
            Add Story
          </button>
          <button
            onClick={() => onTabChange('backlog')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <FolderKanban className="w-5 h-5" />
            View Backlog
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <SprintBurndown activeSprint={activeSprint} backlogItems={backlogItems} />
        </div>
        <div>
          <SprintOverview 
            activeSprint={activeSprint}
            backlogItems={backlogItems}
            members={selectedProject.members || []}
            ownerEmail={ownerEmail}
          />
        </div>
      </div>

      <div className="mt-6">
        <RecentActivity />
      </div>

      <GitHubDashboardSection />
    </div>
  );
}
