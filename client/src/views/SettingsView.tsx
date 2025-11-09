import { useState } from 'react';
import { ThemeCustomization } from '../components/ThemeCustomization';
import { ThemeMode } from '../types';
import { useUser } from '../contexts/UserContext';
import { User, Mail, Briefcase, Calendar, Save, Edit2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';

interface SettingsViewProps {
  currentTheme: string;
  currentMode: ThemeMode;
  onThemeChange: (theme: string) => void;
  onModeChange: (mode: ThemeMode) => void;
  projectId?: string;
  projectName?: string;
  projectDescription?: string;
  projectDeadline?: string;
  onUpdateProject?: (updates: { name?: string; description?: string; deadline?: string }) => void;
}

export function SettingsView({
  currentTheme,
  currentMode,
  onThemeChange,
  onModeChange,
  projectId,
  projectName,
  projectDescription,
  projectDeadline,
  onUpdateProject,
}: SettingsViewProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const [projectFormData, setProjectFormData] = useState({
    name: projectName || '',
    description: projectDescription || '',
    deadline: projectDeadline || '',
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast.success('Profile updated', {
      description: 'Your account settings have been saved',
      duration: 2000,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditing(false);
  };

  const handleSaveProject = () => {
    if (onUpdateProject) {
      onUpdateProject({
        name: projectFormData.name,
        description: projectFormData.description,
        deadline: projectFormData.deadline || undefined,
      });
    }
    setIsEditingProject(false);
  };

  const handleCancelProject = () => {
    setProjectFormData({
      name: projectName || '',
      description: projectDescription || '',
      deadline: projectDeadline || '',
    });
    setIsEditingProject(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Settings (only show if in project context) */}
          {projectId && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Project Settings</h2>
                {!isEditingProject ? (
                  <button
                    onClick={() => setIsEditingProject(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Project
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelProject}
                      className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProject}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    Project Name
                  </label>
                  {isEditingProject ? (
                    <input
                      type="text"
                      value={projectFormData.name}
                      onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-accent/50 rounded-lg">{projectName}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                    Description
                  </label>
                  {isEditingProject ? (
                    <textarea
                      value={projectFormData.description}
                      onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="px-4 py-2 bg-accent/50 rounded-lg">{projectDescription || 'No description'}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Project Deadline
                  </label>
                  {isEditingProject ? (
                    <input
                      type="date"
                      value={projectFormData.deadline ? new Date(projectFormData.deadline).toISOString().split('T')[0] : ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, deadline: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-accent/50 rounded-lg">
                      {projectDeadline ? formatDate(projectDeadline) : 'No deadline set'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Account Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-6 mb-6">
              <Avatar className="w-24 h-24 ring-4 ring-border">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-3xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Profile Picture</p>
                <button className="text-sm text-primary hover:underline">
                  Change avatar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="px-4 py-2 bg-accent/50 rounded-lg">{user.name}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="px-4 py-2 bg-accent/50 rounded-lg">{user.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Role
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <p className="px-4 py-2 bg-accent/50 rounded-lg">{user.role}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Member Since
                </label>
                <p className="px-4 py-2 bg-accent/50 rounded-lg text-muted-foreground">
                  {formatDate(user.joinedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Security</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <button className="text-sm text-primary hover:underline">
                  Change password
                </button>
              </div>
              <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium mb-2 block">Two-Factor Authentication</label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add an extra layer of security to your account
                </p>
                <button className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Customization Sidebar */}
        <div className="lg:col-span-1">
          <ThemeCustomization
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            currentMode={currentMode}
            onModeChange={onModeChange}
          />
        </div>
      </div>
    </div>
  );
}
