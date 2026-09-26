import { ChangeEvent } from 'react';

type InputStateType = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export enum ErrorMsgEnum {
  firstName = 'Invalid First name',
  lastName = 'Invalid Last name',
  password = 'Password must be between 8 to 64 characters, and have at least one small, capital, numeric and special character',
  email = 'Invalid Email',
}

type ErrorMsgType = {
  firstName?: ErrorMsgEnum.firstName | '';
  lastName?: ErrorMsgEnum.lastName | '';
  password?: ErrorMsgEnum.password | '';
  email?: ErrorMsgEnum.email | '';
};

type handleInputChangeType = (e: ChangeEvent<HTMLInputElement>) => void;

export type { InputStateType, ErrorMsgType, handleInputChangeType };
