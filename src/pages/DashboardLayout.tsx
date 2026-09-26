// a child route as per the path will replace the outlet
import { Navbar, Sidebar } from '@/components/layout';
import useResponsive from '@/hooks/useResponsive';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const isMobileScreen = useResponsive();

  return (
    <main className='md:grid md:grid-cols-[82px_1fr]'>
      {isMobileScreen ? <Navbar /> : <Sidebar />}

      <main className='bg-primary-700 md:pt-3'>
        <div className='md:rounded-dashboard bg-white md:h-[calc(100vh-12px)] md:overflow-auto'>
          <Outlet />
        </div>
      </main>
    </main>
  );
};

export default DashboardLayout;
