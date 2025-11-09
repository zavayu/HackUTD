import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpPage as SignUpPageComponent } from '../components/SignUpPage';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function SignUpPage() {
  const navigate = useNavigate();
  const { signup, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/projects', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSignUp = async (data: { name: string; email: string; password: string }) => {
    try {
      setLoading(true);
      await signup(data.email, data.password, data.name);
      
      toast.success('Welcome to AI ProductHub!', {
        description: 'Your account has been created successfully',
        duration: 3000,
      });
      
      navigate('/projects');
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      toast.error('Sign up failed', {
        description: errorMessage,
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return <SignUpPageComponent onSignUp={handleSignUp} loading={loading} />;
}
