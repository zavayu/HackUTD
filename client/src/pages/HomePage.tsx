import { useNavigate } from 'react-router-dom';
import { HomePage as HomePageComponent } from '../components/HomePage';

export function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return <HomePageComponent onGetStarted={handleGetStarted} />;
}
