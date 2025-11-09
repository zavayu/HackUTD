import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginPage as LoginPageComponent } from '../components/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (currentUser) {
    navigate('/projects');
    return null;
  }

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
      let errorMessage = 'Failed to log in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      toast.error('Login failed', {
        description: errorMessage,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return <LoginPageComponent onLogin={handleLogin} loading={loading} />;
}
