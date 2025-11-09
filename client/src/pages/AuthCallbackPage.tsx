import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { toast } from 'sonner';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (error) {
        toast.error('GitHub Authentication Failed', {
          description: decodeURIComponent(error),
        });
        navigate('/');
        return;
      }

      if (token) {
        // Store the token
        api.setToken(token);
        
        toast.success('GitHub Connected', {
          description: 'Successfully authenticated with GitHub',
        });
        
        // Redirect to home page
        navigate('/');
      } else {
        toast.error('Authentication Error', {
          description: 'No token received from GitHub',
        });
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Connecting to GitHub...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we complete the authentication
        </p>
      </div>
    </div>
  );
}
