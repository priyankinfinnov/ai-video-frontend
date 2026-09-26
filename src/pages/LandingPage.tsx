import { useAppSelector } from '@/store/store';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const token = useAppSelector((store) => store.auth.token);

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <Navigate to='/login' replace />;
};

export default LandingPage;

