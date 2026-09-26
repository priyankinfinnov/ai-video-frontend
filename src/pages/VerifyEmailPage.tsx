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

  const [errorMessage, setErrorMessage] = useState<string>('');

  const verificationFailed = (msg?: string) => {
    const errorText = msg || 'Invalid or expired verification link';
    toast.error(errorText);
    setErrorMessage(errorText);
    setIsVerificationFailed(true);
  };

  const handleVerification = async () => {
    if (!token) {
      verificationFailed();
      return;
    }

    try {
      const response = await verifyEmailService(token);
      toast.success(response?.message || 'Email successfully verified');
      toast.loading('Redirecting to Login Page');

      navigate('/login', { state: { from: protectedRouteToVisit ?? '/' } });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
      verificationFailed(msg);
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
            {errorMessage || 'Error: Something wrong in the URL 😢'}
          </span>
        ) : (
          'Loading...'
        )}
      </p>
    </main>
  );
};

export default VerifyEmailPage;
