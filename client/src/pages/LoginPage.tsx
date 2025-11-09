import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage as LoginPageComponent } from '../components/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect to projects if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      await login(email, password);
      
      toast.success('Welcome back!', {
        description: 'Successfully logged in',
        duration: 2000,
      });
      
      navigate('/projects');
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast.error('Login failed', {
        description: error.message || 'Invalid email or password',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return <LoginPageComponent onLogin={handleLogin} loading={loading} />;
}
