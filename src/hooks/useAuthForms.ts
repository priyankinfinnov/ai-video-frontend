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

type useAuthFormsType = (
  initialState: InputStateType,
  errorMsgInitialState: ErrorMsgType
) => useAuthFormReturnValueType;

const useAuthForms: useAuthFormsType = (initialState, errorMsgInitialState) => {
  const [formInputs, setFormInputs] = useState<InputStateType>(initialState);

  const [errorMsg, setErrorMsg] = useState<ErrorMsgType>(errorMsgInitialState);

  const handleInputChange: handleInputChangeType = ({
    target: { value, name },
  }) => {
    setFormInputs((prev) => ({ ...prev, [name]: value }));

    // handles both email and password validation
    const isValid =
      PATTERN_REGEX[name as keyof typeof PATTERN_REGEX].test(value);

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
