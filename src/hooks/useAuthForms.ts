import { useState } from 'react';

import { PATTERN_REGEX } from '@/constants/constants';
import {
  ErrorMsgEnum,
  ErrorMsgType,
  InputStateType,
  handleInputChangeType,
} from '@/types/auth';

type useAuthFormReturnValueType = {
  formInputs: InputStateType;
  errorMsg: ErrorMsgType;
  handleInputChange: handleInputChangeType;
};

type AuthFormOptions = {
  validatePasswordComplexity?: boolean;
};

type useAuthFormsType = (
  initialState: InputStateType,
  errorMsgInitialState: ErrorMsgType,
  options?: AuthFormOptions
) => useAuthFormReturnValueType;

const useAuthForms: useAuthFormsType = (
  initialState,
  errorMsgInitialState,
  options = { validatePasswordComplexity: true }
) => {
  const [formInputs, setFormInputs] = useState<InputStateType>(initialState);

  const [errorMsg, setErrorMsg] = useState<ErrorMsgType>(errorMsgInitialState);

  const handleInputChange: handleInputChangeType = ({
    target: { value, name },
  }) => {
    setFormInputs((prev) => ({ ...prev, [name]: value }));

    const shouldValidatePattern =
      name !== 'password' || options.validatePasswordComplexity !== false;

    // handles both email and password validation
    const isValid =
      shouldValidatePattern && PATTERN_REGEX[name as keyof typeof PATTERN_REGEX]
        ? PATTERN_REGEX[name as keyof typeof PATTERN_REGEX].test(value)
        : true;

    // is value empty or valid, dont show errorMsg
    setErrorMsg({
      ...errorMsg,
      [name]:
        isValid || !value
          ? ''
          : ErrorMsgEnum[name as keyof typeof ErrorMsgEnum],
    });
  };

  return {
    formInputs,
    errorMsg,
    handleInputChange,
  };
};

export default useAuthForms;
