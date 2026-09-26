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
  CallTemplateFormPage,
  DashboardHome,
  CallTemplatePage,
} from './pages';

import { ProtectedRoutes } from './components';
import { useAppDispatch, useAppSelector } from './store/store';
import { useEffect, useState } from 'react';
import { getUserData } from './services/auth';
import { updateUserInfo } from './store/auth/authSlice';
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
            refetchInterval: 5 * 60 * 1000, //5 minutes
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
      dispatch(updateUserInfo(userInfo));
    } catch (error) {
      console.error(error);
      toast.error('Something Went Wrong...');
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
          {/* all the routes mentioned here are protected */}

          <Route index element={<DashboardHome />} />
          <Route path='call-template' element={<CallTemplatePage />} />
          <Route path='call-template-form' element={<CallTemplateFormPage />} />
          <Route path='*' element={<ErrorPage />} />
        </Route>

        {/* public routes */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/auth/verifyEmail' element={<VerifyEmailPage />} />
        <Route path='/pricing' element={<PricingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </QueryClientProvider>
  );
};

export default App;
