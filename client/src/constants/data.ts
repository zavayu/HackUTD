import { BacklogItem, Project } from '../types';

export const initialBacklogItems: BacklogItem[] = [
  {
    id: '1',
    title: 'User authentication with SSO',
    description: 'Implement single sign-on authentication using OAuth 2.0 to streamline user login',
    tags: ['authentication', 'security'],
    priority: 'high',
    progress: 65,
    assignee: 'Sarah Chen',
    storyPoints: 8,
  },
  {
    id: '2',
    title: 'Real-time collaboration features',
    description: 'Add real-time editing capabilities for multiple users working on the same document',
    tags: ['feature', 'collaboration'],
    priority: 'high',
    progress: 40,
    assignee: 'Alex Kumar',
    storyPoints: 13,
  },
  {
    id: '3',
    title: 'Dashboard analytics widgets',
    description: 'Create customizable widget system for displaying key metrics on user dashboard',
    tags: ['analytics', 'ui'],
    priority: 'medium',
    progress: 20,
    assignee: 'Maria Garcia',
    storyPoints: 5,
  },
  {
    id: '4',
    title: 'Mobile app responsive design',
    description: 'Optimize application layout and interactions for mobile devices',
    tags: ['mobile', 'ui/ux'],
    priority: 'medium',
    progress: 80,
    assignee: 'James Wilson',
    storyPoints: 8,
  },
  {
    id: '5',
    title: 'Export data to PDF/Excel',
    description: 'Allow users to export reports and data in multiple formats',
    tags: ['feature', 'export'],
    priority: 'low',
    progress: 10,
    storyPoints: 3,
  },
  {
    id: '6',
    title: 'Integration with Slack notifications',
    description: 'Send automated notifications to Slack channels for important events',
    tags: ['integration', 'notifications'],
    priority: 'low',
    progress: 0,
    assignee: 'Emily Brown',
    storyPoints: 5,
  },
];

export const projects: Project[] = [
  { 
    id: '1', 
    name: 'ProdigyPM', 
    color: 'bg-blue-500',
    description: 'AI-powered product management platform with intelligent insights',
    stats: { stories: 24, sprints: 8, members: 5 },
    starred: true
  },
  { 
    id: '2', 
    name: 'Mobile App v2', 
    color: 'bg-green-500',
    description: 'Next generation mobile experience with enhanced features',
    stats: { stories: 18, sprints: 5, members: 4 },
    starred: false
  },
  { 
    id: '3', 
    name: 'Platform Migration', 
    color: 'bg-purple-500',
    description: 'Enterprise platform modernization and cloud migration',
    stats: { stories: 31, sprints: 12, members: 8 },
    starred: true
  },
  { 
    id: '4', 
    name: 'Customer Portal', 
    color: 'bg-orange-500',
    description: 'Self-service portal for customer support and resources',
    stats: { stories: 15, sprints: 4, members: 3 },
    starred: false
  },
];
