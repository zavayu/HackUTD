import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import { projectService, Project as ApiProject } from '../services/projectService';
import { toast } from 'sonner';

// Map API project to frontend project format
interface FrontendProject {
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

const colorOptions = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
];

export function ProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<FrontendProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStarred, setFilterStarred] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Load projects from API
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const response = await projectService.getProjects();
            
            if (response.success && response.projects) {
                const mappedProjects: FrontendProject[] = response.projects.map((p: ApiProject, index: number) => ({
                    id: p._id,
                    name: p.name,
                    color: colorOptions[index % colorOptions.length],
                    description: p.description,
                    stats: p.stats,
                    starred: false, // TODO: Store starred state in backend
                }));
                setProjects(mappedProjects);
            }
        } catch (error: any) {
            console.error('Failed to load projects:', error);
            toast.error('Failed to load projects', {
                description: error.message,
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                project.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStarred = !filterStarred || project.starred;
            return matchesSearch && matchesStarred;
        });
    }, [projects, searchQuery, filterStarred]);

    const handleSelectProject = (project: FrontendProject) => {
        navigate(`/project/${project.id}`);
        toast.success(`Switched to ${project.name}`, {
            duration: 2000,
        });
    };

    const handleCreateProject = async (name: string, description: string) => {
        try {
            const response = await projectService.createProject(name, description);
            
            if (response.success && response.project) {
                toast.success('Project created!', {
                    description: `${name} has been created successfully`,
                    duration: 2000,
                });
                
                // Reload projects
                await loadProjects();
                setCreateModalOpen(false);
            }
        } catch (error: any) {
            console.error('Failed to create project:', error);
            toast.error('Failed to create project', {
                description: error.message,
                duration: 3000,
            });
        }
    };

    const handleToggleStar = (projectId: string) => {
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, starred: !p.starred } : p
        ));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <LandingPage
                projects={filteredProjects}
                searchQuery={searchQuery}
                filterStarred={filterStarred}
                viewMode={viewMode}
                onSelectProject={handleSelectProject}
                onCreateProject={() => setCreateModalOpen(true)}
                onSearchChange={setSearchQuery}
                onFilterStarredChange={setFilterStarred}
                onViewModeChange={setViewMode}
                onToggleStar={handleToggleStar}
            />
            
            {createModalOpen && (
                <CreateProjectModal
                    onClose={() => setCreateModalOpen(false)}
                    onCreate={handleCreateProject}
                />
            )}
        </>
    );
}

// Create Project Modal Component
function CreateProjectModal({ 
    onClose, 
    onCreate 
}: { 
    onClose: () => void; 
    onCreate: (name: string, description: string) => void;
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setLoading(true);
        await onCreate(name, description);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="My Awesome Project"
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            placeholder="What is this project about?"
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all disabled:opacity-50"
                            disabled={loading || !name.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
