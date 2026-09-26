import { Link, useLocation } from 'react-router-dom';

import { FormEvent, useState } from 'react';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
// import { Checkbox } from '../ui/checkbox';

import { LogoMark } from '@/assets/svgs';
import useAuthForms from '@/hooks/useAuthForms';
import {
  getTrimmedInput,
  isAnyPropertyOfObjEmpty,
  removeCookie,
} from '@/utils/utils';
import toast from 'react-hot-toast';
import { loginService } from '@/services/auth';
import { useAppDispatch } from '@/store/store';
import { addUserCredentials } from '@/store/auth/authSlice';
import { COOKIE_NAMES } from '@/constants/constants';

const LoginForm = () => {
  const loginPageLocation = useLocation();
  const dispatch = useAppDispatch();

  const { formInputs, errorMsg, handleInputChange } = useAuthForms(
    {
      email: '',
      password: '',
    },
    {
      email: '',
      password: '',
    }
  );
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmissionLoading(true);

    const trimmedFormInputs = getTrimmedInput(formInputs);

    const isAnyInputEmpty = isAnyPropertyOfObjEmpty(trimmedFormInputs);
    const isAnyErrorAndMessage = Object.values(errorMsg).find(
      (singleMsg) => !!singleMsg
    );

    // check validations (as user can remove the isRequired or change input type from devtools and can submit)
    if (isAnyInputEmpty) {
      toast.error('Please fill all the inputs');
      setIsSubmissionLoading(false);
      return;
    }

    if (isAnyErrorAndMessage) {
      toast.error(isAnyErrorAndMessage);
      setIsSubmissionLoading(false);
      return;
    }

    try {
      const { message, access_token: token } = await loginService(
        trimmedFormInputs
      );

      dispatch(addUserCredentials(token));
      // if user logged in after verification
      removeCookie(COOKIE_NAMES.PROTECTED_ROUTE_TO_VISIT_AFTER_LOGIN);
      toast.success(message);
    } catch ({ message }) {
      toast.error(message);
    } finally {
      setIsSubmissionLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLoginSubmit}
      className='w-[95vw] max-w-[22.5rem] mx-auto'
    >
      <div className='flex justify-center mb-6'>
        <LogoMark />
      </div>
      <h2 className='text-gray-900 text-2xl md:text-3xl font-semibold text-center mb-2 md:mb-3'>
        Log in to your account
      </h2>
      <p className='text-gray-500 text-base text-center'>
        Welcome back! Please enter your details.
      </p>

      {/* email and password inputs */}
      <div className='pt-8 mb-5 flex flex-col gap-[6px]'>
        <Label className='text-gray-700 text-sm font-medium' htmlFor='email'>
          Email
        </Label>
        <Input
          name='email'
          type='email'
          id='email'
          value={formInputs.email}
          onChange={handleInputChange}
          placeholder='Enter your email'
          isInvalid={!!errorMsg.email}
          autoComplete='off'
          disabled={isSubmissionLoading}
        />
        {!!errorMsg.email && (
          <p className='text-sm text-error-500'>{errorMsg.email}</p>
        )}
      </div>

      {/* remove mb-6 once added remember password feature */}
      <div className='flex flex-col gap-[6px] mb-6'>
        <Label className='text-gray-700 text-sm font-medium' htmlFor='password'>
          Password
        </Label>
        <Input
          name='password'
          type='password'
          id='password'
          value={formInputs.password}
          onChange={handleInputChange}
          placeholder='••••••••'
          isInvalid={!!errorMsg.password}
          autoComplete='off'
          disabled={isSubmissionLoading}
        />
        {!!errorMsg.password && (
          <p className='text-sm text-error-500'>{errorMsg.password}</p>
        )}
      </div>

      {/* will add this later, so commented out */}
      {/* <div className='flex justify-between items-center my-6'>
        <div className='flex gap-2 items-center'>
          <Checkbox id='forgot-password' />
          <Label
            htmlFor='forgot-password'
            className='cursor-pointer font-medium text-sm text-gray-700'
          >
            Remember for 30 days
          </Label>
        </div>

        <Button size='md' variant='link' className='p-0 text-sm font-semibold'>
          Forgot password
        </Button>
      </div> */}

      <div className='pb-8 flex flex-col gap-4'>
        <Button
          type='submit'
          size='lg'
          className='w-full'
          disabled={isSubmissionLoading}
        >
          Log in
        </Button>

        {/* use this google icon later when feature is built */}
        {/* <Button
          size='lg'
          variant='secondary-gray'
          className='flex justify-center items-center gap-3'
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </Button> */}
      </div>
      <p className='flex justify-center items-center gap-1'>
        <span>Don't have an account?</span>

        <Button asChild size='md' variant='link' className='p-0'>
          {/* whatever state this login page holds, pass that state to signup */}
          <Link
            to='/signup'
            state={{ from: loginPageLocation?.state?.from ?? '/' }}
          >
            Sign up
          </Link>
        </Button>
      </p>
    </form>
  );
};

export default LoginForm;
