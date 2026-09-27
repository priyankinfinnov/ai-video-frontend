import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UsersIcon, FilmIcon, ScissorsIcon, LogOutIcon, ZapIcon } from 'lucide-react';
import { LogoMark } from '@/assets/svgs';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { removeUserCredentials } from '@/store/auth/authSlice';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((store) => store.auth.userInfo);

  const isAutomationsActive = location.pathname.startsWith(
    '/dashboard/automations'
  );

  const isPersonaActive =
    (location.pathname === '/dashboard' ||
      location.pathname.startsWith('/dashboard/persona')) &&
    !location.pathname.startsWith('/dashboard/project') &&
    !location.pathname.startsWith('/dashboard/short') &&
    !isAutomationsActive;

  const isShortsActive =
    location.pathname.startsWith('/dashboard/shorts') ||
    location.pathname.startsWith('/dashboard/shorts-form') ||
    (location.pathname.startsWith('/dashboard/projects') &&
      location.search.includes('tab=shorts'));

  const isProjectsActive =
    (location.pathname.startsWith('/dashboard/projects') ||
      location.pathname.startsWith('/dashboard/project-form')) &&
    !isShortsActive;

  const handleLogout = () => {
    dispatch(removeUserCredentials());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const userInitial = userInfo?.name
    ? userInfo.name.charAt(0).toUpperCase()
    : 'U';

  return (
    <aside className='bg-primary-700 flex flex-col justify-between items-center py-6 px-2 h-[100vh] select-none'>
      {/* Top Logo and Nav Items */}
      <div className='flex flex-col items-center gap-8 w-full'>
        <Link
          to='/dashboard'
          className='flex items-center justify-center h-10 w-10 rounded-xl overflow-hidden shadow-sm hover:opacity-90 transition-opacity'
          title='AI Video Creator'
        >
          <div className='scale-75 origin-center'>
            <LogoMark />
          </div>
        </Link>

        <nav className='flex flex-col items-center gap-3 w-full'>
          <Link
            to='/dashboard/personas'
            className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all ${
              isPersonaActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-primary-200 hover:text-white hover:bg-primary-600/50'
            }`}
            title='Personas'
            data-testid='nav-personas'
          >
            <UsersIcon className='w-5 h-5' />
            <span className='text-[10px] font-medium tracking-tight'>Personas</span>
          </Link>

          <Link
            to='/dashboard/automations'
            className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all ${
              isAutomationsActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-primary-200 hover:text-white hover:bg-primary-600/50'
            }`}
            title='Publishing Automations'
            data-testid='nav-automations'
          >
            <ZapIcon className='w-5 h-5' />
            <span className='text-[10px] font-medium tracking-tight'>Automations</span>
          </Link>

          <Link
            to='/dashboard/projects?tab=projects'
            className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all ${
              isProjectsActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-primary-200 hover:text-white hover:bg-primary-600/50'
            }`}
            title='Video Projects'
            data-testid='nav-projects'
          >
            <FilmIcon className='w-5 h-5' />
            <span className='text-[10px] font-medium tracking-tight'>Projects</span>
          </Link>

          <Link
            to='/dashboard/projects?tab=shorts'
            className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all ${
              isShortsActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-primary-200 hover:text-white hover:bg-primary-600/50'
            }`}
            title='Shorts Projects'
            data-testid='nav-shorts'
          >
            <ScissorsIcon className='w-5 h-5' />
            <span className='text-[10px] font-medium tracking-tight'>Shorts</span>
          </Link>
        </nav>
      </div>


      {/* Bottom User Profile & Logout */}
      <div className='flex flex-col items-center gap-4 w-full'>
        <button
          onClick={handleLogout}
          className='flex items-center justify-center w-10 h-10 rounded-xl text-primary-200 hover:text-white hover:bg-primary-600/60 transition-colors'
          title='Sign Out'
          data-testid='logout-button'
        >
          <LogOutIcon className='w-5 h-5' />
        </button>

        <div
          className='w-9 h-9 rounded-full bg-primary-800 text-white font-medium text-xs flex items-center justify-center ring-2 ring-primary-500/40'
          title={userInfo?.email || 'User Account'}
        >
          {userInitial}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
