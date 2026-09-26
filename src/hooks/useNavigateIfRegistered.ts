import { useAppSelector } from '@/store/store';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useNavigateIfRegistered = () => {
  const token = useAppSelector((store) => store.auth.token);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // if token is present in store, and user comes to login or signup, navigate them to dashboard
    if (token) {
      navigate(location?.state?.from ?? '/dashboard', { replace: true });
    }
  }, [token]);
};

export default useNavigateIfRegistered;
