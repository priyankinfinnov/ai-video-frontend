import { AlignJustify as MenuIcon } from 'lucide-react';

import { NavbarLogo } from '@/assets/svgs';
import useResponsive from '@/hooks/useResponsive';
import { Button } from '../ui/button';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navbarLocationInRoute = useLocation();
  const isMobileScreen = useResponsive();

  const linksAndDropdownJSX = (
    <div className='flex items-center gap-8 py-1'>
      <Button
        asChild
        size='lg'
        variant='link-gray'
        className='text-gray-500 text-base p-0'
      >
        <Link to='/'>Home</Link>
      </Button>

      <Button
        asChild
        size='lg'
        variant='link-gray'
        className='text-gray-500 text-base p-0'
      >
        <Link to='/pricing'>Pricing</Link>
      </Button>
    </div>
  );

  return (
    <nav className='h-[4.5rem] md:h-20 flex justify-center items-center'>
      <div className='w-[95vw] max-w-7xl mx-auto flex justify-between items-center md:px-8'>
        <div className='flex gap-10'>
          <NavbarLogo />

          {!isMobileScreen && linksAndDropdownJSX}
        </div>

        {isMobileScreen ? (
          <MenuIcon className='pr-1 md:pr-0 cursor-pointer w-6 h-6' />
        ) : (
          <div className='w-fit'>
            <Link
              className='bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-600 py-[10px] px-[18px] font-semibold text-base'
              to='/login'
              state={{ from: navbarLocationInRoute?.state?.from ?? '/' }}
            >
              Log in
            </Link>

            <Link
              className='bg-primary-600 text-white hover:bg-primary-700 focus:bg-primary-600 focus:shadow-primary py-[10px] px-[18px] font-semibold text-base rounded-lg'
              to='/signup'
              state={{ from: navbarLocationInRoute?.state?.from ?? '/' }}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// 1. used (useResponsive) logic for MenuIcon, instead of display none, (as this is clickable and user can change to display block in devtools).
