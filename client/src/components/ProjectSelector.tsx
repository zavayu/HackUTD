import { ChevronDown, FolderKanban } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectSelectorProps {
  selectedProject: Project;
  projects: Project[];
  onProjectChange: (project: Project) => void;
}

export function ProjectSelector({ selectedProject, projects, onProjectChange }: ProjectSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors">
          <div className={`w-3 h-3 rounded-full ${selectedProject.color}`} />
          <span>{selectedProject.name}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onProjectChange(project)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className={`w-3 h-3 rounded-full ${project.color}`} />
            <FolderKanban className="w-4 h-4" />
            <span>{project.name}</span>
            {selectedProject.id === project.id && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-primary cursor-pointer">
          + New Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
