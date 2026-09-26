import { useEffect, useState } from 'react';

import { MAX_MOBILE_WIDTH } from '@/constants/constants';

const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () =>
    window.innerWidth < MAX_MOBILE_WIDTH
      ? setIsMobile(true)
      : setIsMobile(false);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useResponsive;
