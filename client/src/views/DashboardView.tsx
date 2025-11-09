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

interface DashboardViewProps {
  selectedProject: Project;
  projects: Project[];
  theme: string;
  ownerEmail: string;
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
  onProjectChange,
  onThemeChange,
  onTabChange,
  onNewStoryClick,
  onAddMember,
  onRemoveMember,
}: DashboardViewProps) {
  const [teamModalOpen, setTeamModalOpen] = useState(false);

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
          <SprintBurndown />
        </div>
        <div>
          <SprintOverview />
        </div>
      </div>

      <div className="mt-6">
        <RecentActivity />
      </div>

      <GitHubDashboardSection />
    </div>
  );
}
