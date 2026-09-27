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
  PersonaDetailsPage,
  ProjectsPage,
  ProjectFormPage,
  ProjectDetailsPage,
  ShortsFormPage,
  AutomationsPage,
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
          <Route path='personas/:id' element={<PersonaDetailsPage />} />
          <Route path='personas/:id/integrations' element={<PersonaDetailsPage defaultTab='integrations' />} />
          <Route path='personas/:id/automations' element={<PersonaDetailsPage defaultTab='automations' />} />
          <Route path='persona-details' element={<PersonaDetailsPage />} />
          <Route path='persona-form' element={<PersonaFormPage />} />
          <Route path='automations' element={<AutomationsPage />} />
          <Route path='projects' element={<ProjectsPage />} />
          <Route path='projects/:id' element={<ProjectDetailsPage />} />
          <Route path='project-details' element={<ProjectDetailsPage />} />
          <Route path='shorts' element={<ProjectsPage defaultTab='shorts' />} />
          <Route path='project-form' element={<ProjectFormPage />} />
          <Route path='shorts-form' element={<ShortsFormPage />} />
          <Route path='*' element={<ErrorPage />} />
        </Route>

        {/* Support OAuth redirect to /personas/:id, /personas/:id/integrations, and /personas */}
        <Route
          path='/personas'
          element={
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          }
        >
          <Route index element={<PersonaPage />} />
          <Route path=':id' element={<PersonaDetailsPage />} />
          <Route path=':id/integrations' element={<PersonaDetailsPage defaultTab='integrations' />} />
          <Route path=':id/automations' element={<PersonaDetailsPage defaultTab='automations' />} />
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
