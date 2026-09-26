import { Link, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
// import { Checkbox } from '../ui/checkbox';

import { LogoMark } from '@/assets/svgs';
import useAuthForms from '@/hooks/useAuthForms';
import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getTrimmedInput,
  isAnyPropertyOfObjEmpty,
  setCookie,
} from '@/utils/utils';
import { signupService } from '@/services/auth';
import { COOKIE_NAMES } from '@/constants/constants';

type countryType = {
  countryCode: string;
  dialCode: string;
  format: string;
  name: string;
};

const SignupForm = () => {
  const signupPageLocation = useLocation();

  const { formInputs, errorMsg, handleInputChange } = useAuthForms(
    { firstName: '', lastName: '', email: '', password: '' },
    { firstName: '', lastName: '', email: '', password: '' }
  );

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState<boolean>(true);
  const [isSignupFormSubmitted, setIsSignupFormSubmitted] = useState(false);
  const [isSubmissionLoading, setIsSubmissionLoading] = useState(false);

  const updateFormSubmissionBool = (isSubmitted: boolean) =>
    setIsSignupFormSubmitted(isSubmitted);

  const handlePhoneNumberChange = (
    value: string,
    { dialCode, format }: countryType,
    _e: ChangeEvent<HTMLInputElement>,
    formattedValue: string
  ) => {
    // console log country and value to understand

    const valueLengthWithoutDialCode = value.length - dialCode.length;

    const isValid =
      formattedValue.length === format.length ||
      valueLengthWithoutDialCode === 0 ||
      valueLengthWithoutDialCode > 10; // bug from package

    // // phone number validation
    setIsPhoneNumberValid(isValid);
    setPhoneNumber(value);
  };

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmissionLoading(true);

    const trimmedFormInputs = getTrimmedInput(formInputs);

    const isAnyInputEmpty = isAnyPropertyOfObjEmpty(trimmedFormInputs);
    const isAnyErrorAndMessage = Object.values(errorMsg).find(
      (singleMsg) => !!singleMsg
    );

    // check validations (as user can remove the isRequired from devtools and can submit)
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

    const fullName = [trimmedFormInputs.firstName, trimmedFormInputs.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    try {
      const response = await signupService({
        name: fullName || 'User',
        email: trimmedFormInputs.email!,
        password: trimmedFormInputs.password!,
        ...(phoneNumber ? { phoneNumber } : {}),
      });

      // setting the protected route into cookies, so user can access the same protected route during verification in '/auth/verifyEmail' and pass it to login page from there.
      setCookie({
        cookieName: COOKIE_NAMES.PROTECTED_ROUTE_TO_VISIT_AFTER_LOGIN,
        cookieValue: signupPageLocation?.state?.from ?? '/',
      });
      updateFormSubmissionBool(true);
      toast.success(
        response?.message || 'Verification link sent to your email successfully'
      );
    } catch (err: unknown) {
      updateFormSubmissionBool(false);
      const error = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to create account';
      toast.error(errorMessage);
    } finally {
      setIsSubmissionLoading(false);
    }
  };

  const inputsJSX = (
    <>
      <div className='flex gap-4 pt-8 mb-5 '>
        <div className='flex flex-col gap-[6px]'>
          <Label
            className='text-gray-700 text-sm font-medium'
            htmlFor='firstName'
          >
            First Name
          </Label>
          <Input
            name='firstName'
            type='text'
            id='firstName'
            value={formInputs.firstName}
            onChange={handleInputChange}
            placeholder='John'
            isInvalid={!!errorMsg.firstName}
            autoComplete='off'
            disabled={isSubmissionLoading}
          />
          {!!errorMsg.firstName && (
            <p className='text-sm text-error-500'>{errorMsg.firstName}</p>
          )}
        </div>

        <div className='flex flex-col gap-[6px]'>
          <Label
            className='text-gray-700 text-sm font-medium'
            htmlFor='lastName'
          >
            Last Name
          </Label>
          <Input
            name='lastName'
            type='text'
            id='lastName'
            value={formInputs.lastName}
            onChange={handleInputChange}
            placeholder='Doe'
            isInvalid={!!errorMsg.lastName}
            autoComplete='off'
            disabled={isSubmissionLoading}
          />
          {!!errorMsg.lastName && (
            <p className='text-sm text-error-500'>{errorMsg.lastName}</p>
          )}
        </div>
      </div>

      <div className='mb-4'>
        <Label className='text-gray-700 text-sm font-medium'>
          Phone
          <PhoneInput
            containerClass='mb-4 mt-[6px] !w-full'
            inputClass={`border !border-gray-300 !bg-white !py-[0.625rem] !px-[2.875rem] text-gray-500 !text-base !rounded-lg !w-full !h-fit ${
              isSubmissionLoading &&
              'disabled:cursor-not-allowed disabled:opacity-50'
            } ${
              // isValid then gray-900
              isPhoneNumberValid
                ? '!text-gray-900 focus-visible:!outline-primary-500'
                : '!border-error-300 !shadow-destructive focus-visible:!outline-none'
            }`}
            dropdownClass='!w-[95vw] !max-w-[22.5rem]'
            inputProps={{ required: true }}
            country={'in'}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            disabled={isSubmissionLoading}
          />
        </Label>

        {!isPhoneNumberValid && (
          <p className='text-sm text-error-500'>Phone Number not valid</p>
        )}
      </div>

      {/* email input*/}
      <div className='mb-4 flex flex-col gap-[6px]'>
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

      {/* now for button its mb-8, if there are other signup options like google, fb, or github, then only remove mb-8*/}

      <Button
        type='submit'
        size='lg'
        className='w-full mb-8'
        disabled={isSubmissionLoading}
      >
        Create an account
      </Button>

      {/* other signup options */}
      {/* <p className='my-6 text-center'>OR</p>

      <div className='flex flex-col gap-3 mb-8'>
        <Button
          size='lg'
          variant='secondary-gray'
          className='flex justify-center items-center gap-3'
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </Button>
      </div> */}

      <p className='flex justify-center items-center gap-1'>
        <span>Already have an account?</span>

        <Button asChild size='md' variant='link' className='p-0'>
          {/* whatever state this signup page holds, pass that state to login */}
          <Link
            to='/login'
            state={{ from: signupPageLocation?.state?.from ?? '/' }}
          >
            Log in
          </Link>
        </Button>
      </p>
    </>
  );

  return (
    <form
      onSubmit={handleSignupSubmit}
      className='w-[95vw] max-w-[22.5rem] mx-auto'
    >
      <div className='flex justify-center mb-6'>
        <LogoMark />
      </div>
      <h2 className='text-gray-900 text-2xl md:text-3xl font-semibold text-center mb-2 md:mb-3'>
        Create an account
      </h2>
      <p className='text-gray-500 text-base text-center'>
        Start your 30-day free trial.
      </p>

      {isSignupFormSubmitted ? (
        <p className='text-gray-500 text-base border-2 border-primary-300 rounded-lg py-6 px-8 mt-8'>
          We have sent a verification link to your email address. Click on that
          link to verify.
        </p>
      ) : (
        inputsJSX
      )}
    </form>
  );
};

export default SignupForm;
