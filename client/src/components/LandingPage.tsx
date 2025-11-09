import { Zap, FolderKanban, ArrowRight, Users, CheckCircle, Search, Star, Grid3x3, List } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  stats?: {
    stories: number;
    sprints: number;
    members: number;
  };
  starred?: boolean;
}

interface LandingPageProps {
  projects: Project[];
  searchQuery: string;
  filterStarred: boolean;
  viewMode: 'grid' | 'list';
  onSelectProject: (project: Project) => void;
  onCreateProject?: () => void;
  onSearchChange: (query: string) => void;
  onFilterStarredChange: (starred: boolean) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onToggleStar: (projectId: string) => void;
}

export function LandingPage({ 
  projects, 
  searchQuery,
  filterStarred,
  viewMode,
  onSelectProject, 
  onCreateProject,
  onSearchChange,
  onFilterStarredChange,
  onViewModeChange,
  onToggleStar
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-foreground">AI ProductHub</h2>
                <p className="text-sm text-muted-foreground">Select a project to continue</p>
              </div>
            </div>

            <button
              onClick={onCreateProject}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <FolderKanban className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="mb-2 text-foreground">Your Projects</h1>
              <p className="text-muted-foreground">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} {filterStarred ? 'starred' : 'available'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border border-border hover:bg-accent'
                )}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border border-border hover:bg-accent'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            
            <button
              onClick={() => onFilterStarredChange(!filterStarred)}
              className={cn(
                'px-4 py-2 rounded-lg transition-all flex items-center gap-2',
                filterStarred
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:bg-accent'
              )}
            >
              <Star className={cn('w-4 h-4', filterStarred && 'fill-current')} />
              Starred
            </button>
          </div>
        </div>

        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
        )}>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {viewMode === 'grid' ? (
                <div className="relative w-full bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-200 group">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(project.id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-all active:scale-90 z-10"
                  >
                    <Star className={cn(
                      'w-4 h-4 transition-all duration-200',
                      project.starred 
                        ? 'fill-yellow-400 text-yellow-400 scale-110' 
                        : 'text-muted-foreground hover:text-yellow-400 hover:scale-110'
                    )} />
                  </button>

                  <button
                    onClick={() => onSelectProject(project)}
                    className="w-full text-left pr-12"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center`}>
                        <FolderKanban className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <h3 className="mb-2 text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {project.name}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </h3>
                    
                    {project.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {project.stats && (
                      <div className="flex items-center gap-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3" />
                          <span>{project.stats.stories} stories</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3" />
                          <span>{project.stats.sprints} sprints</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{project.stats.members}</span>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="relative w-full bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-200 group">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(project.id);
                    }}
                    className="absolute top-4 right-14 p-2 rounded-lg hover:bg-accent transition-all active:scale-90 z-10"
                  >
                    <Star className={cn(
                      'w-4 h-4 transition-all duration-200',
                      project.starred 
                        ? 'fill-yellow-400 text-yellow-400 scale-110' 
                        : 'text-muted-foreground hover:text-yellow-400 hover:scale-110'
                    )} />
                  </button>

                  <button
                    onClick={() => onSelectProject(project)}
                    className="w-full text-left flex items-center gap-4 pr-20"
                  >
                    <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center flex-shrink-0`}>
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1 text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {project.description}
                        </p>
                      )}

                      {project.stats && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle className="w-3 h-3" />
                            <span>{project.stats.stories} stories</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Zap className="w-3 h-3" />
                            <span>{project.stats.sprints} sprints</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{project.stats.members}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 absolute right-4 top-1/2 -translate-y-1/2" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-foreground">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to get started with AI ProductHub
            </p>
            <button
              onClick={onCreateProject}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
