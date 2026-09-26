import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { COOKIE_NAMES } from '@/constants/constants';
import { verifyEmailService } from '@/services/auth';
import { getCookieValue } from '@/utils/utils';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isVerificationFailed, setIsVerificationFailed] = useState(false);

  // if signed in, then it'll be there in the cookie
  const protectedRouteToVisit = getCookieValue(
    COOKIE_NAMES.PROTECTED_ROUTE_TO_VISIT_AFTER_LOGIN
  );

  const verificationFailed = () => {
    toast.error('Invalid URL');
    setIsVerificationFailed(true);
  };

  const handleVerification = async () => {
    if (!token) {
      verificationFailed();
      return;
    }

    try {
      await verifyEmailService(token);
      toast.success('Verification Done');
      toast.loading('Redirecting to Login Page');

      navigate('/login', { state: { from: protectedRouteToVisit ?? '/' } });
    } catch (error) {
      verificationFailed();
    }
  };

  useEffect(() => {
    handleVerification();
  }, []);

  return (
    <main className='p-12'>
      <p className='text-lg md:text-2xl text-center'>
        {isVerificationFailed ? (
          <span className='text-error-500'>
            Error: Something wrong in the URL 😢
          </span>
        ) : (
          'Loading...'
        )}
      </p>
    </main>
  );
};

export default VerifyEmailPage;
