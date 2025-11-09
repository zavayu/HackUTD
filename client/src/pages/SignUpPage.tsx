import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpPage as SignUpPageComponent } from '../components/SignUpPage';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function SignUpPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect to projects if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = async (data: { name: string; email: string; password: string }) => {
    try {
      setLoading(true);
      await signup(data.email, data.password, data.name);
      
      toast.success('Welcome to ProdigyPM!', {
        description: 'Your account has been created successfully',
        duration: 3000,
      });
      
      navigate('/projects');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      toast.error('Sign up failed', {
        description: error.message || 'Failed to create account',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return <SignUpPageComponent onSignUp={handleSignUp} loading={loading} />;
}
