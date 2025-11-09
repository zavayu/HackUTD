import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import { projects as initialProjects } from '../constants/data';
import { toast } from 'sonner';
import { Project } from '../types';

export function ProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStarred, setFilterStarred] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                project.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStarred = !filterStarred || project.starred;
            return matchesSearch && matchesStarred;
        });
    }, [projects, searchQuery, filterStarred]);

    const handleSelectProject = (project: Project) => {
        navigate(`/project/${project.id}`);
        toast.success(`Switched to ${project.name}`, {
            duration: 2000,
        });
    };

    const handleCreateProject = () => {
        toast.info('Create project', {
            description: 'Project creation coming soon!',
            duration: 2000,
        });
    };

    const handleToggleStar = (projectId: string) => {
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, starred: !p.starred } : p
        ));
    };

    return (
        <LandingPage
            projects={filteredProjects}
            searchQuery={searchQuery}
            filterStarred={filterStarred}
            viewMode={viewMode}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onSearchChange={setSearchQuery}
            onFilterStarredChange={setFilterStarred}
            onViewModeChange={setViewMode}
            onToggleStar={handleToggleStar}
        />
    );
}
