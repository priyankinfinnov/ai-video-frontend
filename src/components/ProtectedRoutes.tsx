import { useAppSelector } from '@/store/store';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type ProtectedRoutesProps = {
  children: ReactNode;
};

// if there is not token in the authSlice, direct them to login, else navigate to the children (route)
const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const token = useAppSelector((store) => store.auth.token);

  // routesLocation
  const { pathname: routePathname } = useLocation();

  if (!token)
    return <Navigate to='/login' state={{ from: routePathname }} replace />;

  return children;
};

export default ProtectedRoutes;
