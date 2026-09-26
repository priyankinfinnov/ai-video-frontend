import { Route, Routes } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import {
  Login,
  DashboardLayout,
  Signup,
  ErrorPage,
  LandingPage,
  PricingPage,
  VerifyEmailPage,
  PersonaPage,
  PersonaFormPage,
} from './pages';

import { ProtectedRoutes } from './components';
import { useAppDispatch, useAppSelector } from './store/store';
import { useEffect, useState } from 'react';
import { getUserData } from './services/auth';
import { removeUserCredentials, updateUserInfo } from './store/auth/authSlice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const App = () => {
  const token = useAppSelector((store) => store.auth.token);
  const dispatch = useAppDispatch();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: true,
            retry: 3,
            refetchInterval: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );

  const fetchUserInfo = async () => {
    if (!token) {
      return;
    }

    try {
      const userInfo = await getUserData(token);
      if (userInfo) {
        dispatch(updateUserInfo(userInfo));
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number };
      };
      console.error('Failed to fetch user data:', err);
      if (error?.response?.status === 401) {
        dispatch(removeUserCredentials());
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Unable to fetch user profile.');
      }
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [token]);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <Toaster
        position='top-right'
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />
      <Routes>
        <Route
          path='/dashboard'
          element={
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          }
        >
          {/* Landing on /dashboard directly opens Persona table */}
          <Route index element={<PersonaPage />} />
          <Route path='personas' element={<PersonaPage />} />
          <Route path='persona-form' element={<PersonaFormPage />} />
          <Route path='*' element={<ErrorPage />} />
        </Route>

        {/* public routes */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/auth/verifyEmail' element={<VerifyEmailPage />} />
        <Route path='/pricing' element={<PricingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;
