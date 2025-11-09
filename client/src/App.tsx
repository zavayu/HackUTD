import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BacklogCard, BacklogItem } from './components/BacklogCard';
import { AICopilot } from './components/AICopilot';
import { NewStoryModal } from './components/NewStoryModal';
import { ThemeToggle } from './components/ThemeToggle';
import { ProjectSelector } from './components/ProjectSelector';
import { DashboardKPIs } from './components/DashboardKPIs';
import { AISummaryPanel } from './components/AISummaryPanel';
import { BacklogFilters } from './components/BacklogFilters';
import { KanbanBoard } from './components/KanbanBoard';
import { ThemeCustomization } from './components/ThemeCustomization';
import { SprintBurndown } from './components/SprintBurndown';
import { SprintOverview } from './components/SprintOverview';
import { RecentActivity } from './components/RecentActivity';
import { QuickStats } from './components/QuickStats';
import { GitHubProvider } from './components/GitHubContext';
import { GitHubDashboardSection } from './components/GitHubDashboardSection';
import { AIInsightsView } from './components/AIInsightsView';
import { LandingPage } from './components/LandingPage';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Plus, Play, ListPlus, FolderKanban } from 'lucide-react';
import { Toaster, toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';

const initialBacklogItems: BacklogItem[] = [
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

const projects = [
  { 
    id: '1', 
    name: 'AI ProductHub', 
    color: 'bg-blue-500',
    description: 'AI-powered product management platform with intelligent insights',
    stats: { stories: 24, sprints: 8, members: 5 }
  },
  { 
    id: '2', 
    name: 'Mobile App v2', 
    color: 'bg-green-500',
    description: 'Next generation mobile experience with enhanced features',
    stats: { stories: 18, sprints: 5, members: 4 }
  },
  { 
    id: '3', 
    name: 'Platform Migration', 
    color: 'bg-purple-500',
    description: 'Enterprise platform modernization and cloud migration',
    stats: { stories: 31, sprints: 12, members: 8 }
  },
  { 
    id: '4', 
    name: 'Customer Portal', 
    color: 'bg-orange-500',
    description: 'Self-service portal for customer support and resources',
    stats: { stories: 15, sprints: 4, members: 3 }
  },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'projects' | 'project'>('home');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workspaceTab, setWorkspaceTab] = useState('backlog');
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [newStoryModalOpen, setNewStoryModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'theme-blue';
  });
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme-mode') as 'light' | 'dark' | 'system') || 'light';
  });
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(initialBacklogItems);
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  // Initialize theme on mount and listen for system preference changes
  useEffect(() => {
    // Apply saved theme
    document.documentElement.classList.remove('theme-blue', 'theme-teal', 'theme-purple');
    document.documentElement.classList.add(theme);

    // Apply theme mode
    const applyThemeMode = (mode: 'light' | 'dark' | 'system') => {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (mode === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyThemeMode(themeMode);

    // Listen for system preference changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') {
        applyThemeMode('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, themeMode]);

  const handleThemeChange = (newTheme: string) => {
    // Remove old theme class
    document.documentElement.classList.remove('theme-blue', 'theme-teal', 'theme-purple');
    // Add new theme class
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setThemeMode(newMode);
    localStorage.setItem('theme-mode', newMode);

    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleCreateStory = (story: any) => {
    const newStory: BacklogItem = {
      id: Date.now().toString(),
      ...story,
    };
    setBacklogItems([newStory, ...backlogItems]);
    
    toast.success('Story created successfully!', {
      description: `AI created: ${story.title}`,
      duration: 3000,
    });
  };

  const handleAIPrompt = (prompt: string) => {
    toast.info('AI is processing your request...', {
      description: prompt,
      duration: 2000,
    });
  };

  const handleAISuggestion = (type: string) => {
    const messages = {
      'acceptance-criteria': 'Generating acceptance criteria for selected stories...',
      'summarize': 'Summarizing user feedback...',
      'prioritize': 'Analyzing backlog for smart prioritization...',
      'estimate': 'Estimating story points based on complexity...',
    };
    
    toast.info('AI Suggestion', {
      description: messages[type as keyof typeof messages] || 'Processing AI suggestion...',
      duration: 2000,
    });
  };

  const handleItemMove = (itemId: string, newStatus: string) => {
    setBacklogItems((items) =>
      items.map((item) => {
        if (item.id === itemId) {
          let newProgress = item.progress;
          if (newStatus === 'todo') newProgress = 0;
          else if (newStatus === 'in-progress') newProgress = Math.max(1, Math.min(99, item.progress));
          else if (newStatus === 'done') newProgress = 100;
          
          return { ...item, progress: newProgress };
        }
        return item;
      })
    );
    
    toast.success('Task moved successfully', {
      duration: 1500,
    });
  };

  const handleApplyAIChanges = (changes: any) => {
    toast.success('AI changes applied!', {
      description: 'Your backlog has been updated based on AI recommendations',
      duration: 3000,
    });
  };

  const handleLogin = () => {
    // Simple login with no validation
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    setCurrentView('projects');
    toast.success('Welcome back!', {
      description: 'Successfully logged in',
      duration: 2000,
    });
  };

  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const handleSelectProject = (project: typeof projects[0]) => {
    setSelectedProject(project);
    setCurrentView('project');
    setActiveTab('dashboard');
    toast.success(`Switched to ${project.name}`, {
      duration: 2000,
    });
  };

  const handleBackToProjects = () => {
    if (isLoggedIn) {
      setCurrentView('projects');
    } else {
      setCurrentView('home');
    }
  };

  const handleCreateProject = () => {
    toast.info('Create project', {
      description: 'Project creation coming soon!',
      duration: 2000,
    });
  };

  // Show home page
  if (currentView === 'home') {
    return (
      <GitHubProvider>
        <div className="bg-background text-foreground">
          <Toaster richColors position="top-right" />
          <HomePage onGetStarted={handleGetStarted} />
        </div>
      </GitHubProvider>
    );
  }

  // Show login page
  if (currentView === 'login') {
    return (
      <GitHubProvider>
        <div className="bg-background text-foreground">
          <Toaster richColors position="top-right" />
          <LoginPage onLogin={handleLogin} />
        </div>
      </GitHubProvider>
    );
  }

  // Show projects listing
  if (currentView === 'projects') {
    return (
      <GitHubProvider>
        <div className="bg-background text-foreground">
          <Toaster richColors position="top-right" />
          <LandingPage
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
          />
        </div>
      </GitHubProvider>
    );
  }

  return (
    <GitHubProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Toaster richColors position="top-right" />
        
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          currentProject={selectedProject}
          projects={projects}
          onProjectChange={handleSelectProject}
          onBackToProjects={handleBackToProjects}
        />
        
        <div className="flex-1 flex flex-col">
          <TopBar
            onAICopilotToggle={() => setAiCopilotOpen(!aiCopilotOpen)}
            aiCopilotOpen={aiCopilotOpen}
          />
          
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto">
              {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <ProjectSelector
                    selectedProject={selectedProject}
                    projects={projects}
                    onProjectChange={setSelectedProject}
                  />
                  <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
                </div>

                <div className="mb-6">
                  <h1 className="mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Overview of {selectedProject.name} project health and progress
                  </p>
                </div>

                <QuickStats />

                <DashboardKPIs />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <div className="lg:col-span-2">
                    <AISummaryPanel />
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setActiveTab('sprints');
                        toast.info('Starting new sprint...');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Play className="w-5 h-5" />
                      Start Sprint
                    </button>
                    <button
                      onClick={() => setNewStoryModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <ListPlus className="w-5 h-5" />
                      Add Story
                    </button>
                    <button
                      onClick={() => setActiveTab('backlog')}
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

                {/* GitHub Integration Section */}
                <GitHubDashboardSection />
              </div>
            )}

            {/* Backlog View */}
            {activeTab === 'backlog' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="mb-2">Product Backlog</h1>
                    <p className="text-muted-foreground">
                      Manage and prioritize your product stories with AI assistance
                    </p>
                  </div>
                  <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
                </div>

                <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="backlog">Backlog</TabsTrigger>
                    <TabsTrigger value="board">Board</TabsTrigger>
                  </TabsList>

                  <TabsContent value="backlog" className="space-y-4">
                    <BacklogFilters onAISuggestion={handleAISuggestion} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {backlogItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <BacklogCard item={item} />
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="board" className="space-y-6">
                    <KanbanBoard items={backlogItems} onItemMove={handleItemMove} />
                    
                    {/* AI Workspace Section */}
                    <div className="max-w-4xl mx-auto mt-8">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 text-center border border-border">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="mb-2">AI-Powered Story Generation</h2>
                        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                          Let AI help you create detailed user stories with acceptance criteria,
                          estimates, and smart prioritization
                        </p>
                        <button
                          onClick={() => setNewStoryModalOpen(true)}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all duration-200"
                        >
                          Generate Story with AI
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="bg-card border border-border rounded-xl p-6">
                          <h3 className="mb-2">Smart Prioritization</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            AI analyzes business value, dependencies, and team capacity to suggest
                            optimal story prioritization
                          </p>
                          <button
                            onClick={() => handleAISuggestion('prioritize')}
                            className="text-sm text-primary hover:underline"
                          >
                            Try it now →
                          </button>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6">
                          <h3 className="mb-2">Sprint Planning Assistant</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Get AI recommendations for sprint capacity, story allocation, and risk
                            assessment
                          </p>
                          <button
                            onClick={() => setActiveTab('sprints')}
                            className="text-sm text-primary hover:underline"
                          >
                            Start planning →
                          </button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Sprints View */}
            {activeTab === 'sprints' && (
              <div className="p-8">
                <h1 className="mb-6">Sprint Planning</h1>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="mb-4">Current Sprint (Sprint 23)</h3>
                  <p className="text-muted-foreground mb-6">Nov 1 - Nov 14, 2025</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {backlogItems.slice(0, 4).map((item) => (
                      <BacklogCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Insights View */}
            {activeTab === 'insights' && (
              <div className="p-8">
                <AIInsightsView />
              </div>
            )}

            {/* Settings View */}
            {activeTab === 'settings' && (
              <div className="p-8">
                <ThemeCustomization
                  currentTheme={theme}
                  onThemeChange={handleThemeChange}
                  currentMode={themeMode}
                  onModeChange={handleThemeModeChange}
                />
              </div>
            )}
          </div>

          <AICopilot
            isOpen={aiCopilotOpen}
            onClose={() => setAiCopilotOpen(false)}
            onPromptClick={handleAIPrompt}
            onApplyChanges={handleApplyAIChanges}
          />
        </div>
      </div>

      <NewStoryModal
        isOpen={newStoryModalOpen}
        onClose={() => setNewStoryModalOpen(false)}
        onCreateStory={handleCreateStory}
      />

      <button
        onClick={() => setNewStoryModalOpen(true)}
        className="fixed bottom-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        style={{ right: aiCopilotOpen ? '25rem' : '2rem' }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
    </GitHubProvider>
  );
}
