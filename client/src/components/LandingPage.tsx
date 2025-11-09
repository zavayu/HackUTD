import { Zap, FolderKanban, ArrowRight, Users, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

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
}

interface LandingPageProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateProject?: () => void;
}

export function LandingPage({ projects, onSelectProject, onCreateProject }: LandingPageProps) {
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
          <h1 className="mb-2 text-foreground">Your Projects</h1>
          <p className="text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onSelectProject(project)}
                className="w-full bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${project.color} flex items-center justify-center`}>
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <h3 className="mb-2 text-foreground group-hover:text-primary transition-colors">
                  {project.name}
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
