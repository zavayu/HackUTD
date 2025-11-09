import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Mail, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function ProfileDropdown() {
  const { user } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleSettings = () => {
    setIsOpen(false);
    // Navigate to settings tab in the current project or projects page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/project/')) {
      // If we're in a project, navigate to settings tab
      navigate(currentPath, { state: { tab: 'settings' } });
      // Trigger tab change via custom event
      window.dispatchEvent(new CustomEvent('navigate-to-settings'));
    } else {
      // If we're on projects page, go to first project's settings
      toast.info('Opening settings...', {
        description: 'Navigate to a project to access settings',
        duration: 2000,
      });
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    // Clear any stored auth data
    localStorage.removeItem('github_connection');
    
    logout();
    
    toast.success('Signed out successfully', {
      description: 'You have been logged out',
      duration: 2000,
    });
    
    // Navigate to login page
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-all"
      >
        <Avatar className="cursor-pointer ring-2 ring-border hover:ring-primary/50 transition-all">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Profile Header */}
            <div className="bg-primary p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
              <div className="relative flex items-center gap-4">
                <Avatar className="w-16 h-16 ring-4 ring-white/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl bg-white/20 text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate text-primary-foreground">{user.name}</h3>
                  <p className="text-sm opacity-80 truncate text-primary-foreground">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="p-4 space-y-3 border-b border-border">
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-foreground truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Member since</p>
                  <p className="text-foreground">{formatDate(user.joinedDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">User ID</p>
                  <p className="text-foreground font-mono text-xs">{user.id}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left group"
              >
                <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-foreground">Account Settings</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
