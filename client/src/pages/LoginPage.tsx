import { useNavigate } from 'react-router-dom';
import { LoginPage as LoginPageComponent } from '../components/LoginPage';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    login();
    navigate('/projects');
    toast.success('Welcome back!', {
      description: 'Successfully logged in',
      duration: 2000,
    });
  };

  return <LoginPageComponent onLogin={handleLogin} />;
}
