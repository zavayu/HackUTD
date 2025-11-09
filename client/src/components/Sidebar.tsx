import { useState } from 'react';
import { LayoutDashboard, ListTodo, Zap, TrendingUp, Settings, FolderOpen, ChevronDown, Check, Kanban } from 'lucide-react';
import { cn } from './ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentProject?: Project;
  projects?: Project[];
  onProjectChange?: (project: Project) => void;
  onBackToProjects?: () => void;
}

export function Sidebar({ activeTab, onTabChange, currentProject, projects = [], onProjectChange, onBackToProjects }: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'backlog', label: 'Backlog', icon: ListTodo },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'sprints', label: 'Sprints', icon: Zap },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <button 
        onClick={onBackToProjects}
        className="p-6 border-b border-border hover:bg-accent transition-colors text-left w-full group"
      >
        <h2 className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span>ProdigyPM</span>
        </h2>
        {currentProject && (
          <p className="text-xs text-muted-foreground mt-1 ml-10">{currentProject.name}</p>
        )}
      </button>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 mb-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Project</span>
          </div>
          
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left bg-accent/50 hover:bg-accent border border-border hover:border-primary/50"
              >
                {currentProject && (
                  <>
                    <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', currentProject.color)} />
                    <span className="flex-1 text-sm truncate text-foreground">{currentProject.name}</span>
                  </>
                )}
                {!currentProject && (
                  <span className="flex-1 text-sm text-muted-foreground">Select project</span>
                )}
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  dropdownOpen && "rotate-180"
                )} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-card border-border"
              sideOffset={4}
            >
              {projects.map((project, index) => (
                <div key={project.id}>
                  <DropdownMenuItem
                    onClick={() => {
                      onProjectChange?.(project);
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', project.color)} />
                    <span className="flex-1 text-sm truncate">{project.name}</span>
                    {currentProject?.id === project.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                  {index < projects.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
              
              {projects.length > 0 && <DropdownMenuSeparator />}
              
              <DropdownMenuItem
                onClick={() => {
                  onBackToProjects?.();
                  setDropdownOpen(false);
                }}
                className="px-3 py-2.5 cursor-pointer focus:bg-accent focus:text-accent-foreground text-primary"
              >
                <FolderOpen className="w-4 h-4 mr-3" />
                <span className="text-sm">View All Projects</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
