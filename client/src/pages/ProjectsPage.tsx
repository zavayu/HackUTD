import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import { projects } from '../constants/data';
import { toast } from 'sonner';
import { Project } from '../types';

export function ProjectsPage() {
    const navigate = useNavigate();

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

    return (
        <LandingPage
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
        />
    );
}
