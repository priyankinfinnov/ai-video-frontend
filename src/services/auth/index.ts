import { InputStateType } from '@/types/auth';
import { apiFetch } from '..';
import { DASH_API } from '@/constants/constants';

export const loginService = async (userData: InputStateType) => {
  const response = await apiFetch.post(`${DASH_API}/users/login`, userData);
  if (response.status === 200 || response.status === 201) {
    const { success, message } = response.data;

    if (!success) {
      throw new Error(message);
    }

    return response.data;
  }
};

export const signupService = async (userData: InputStateType) => {
  const response = await apiFetch.post(`${DASH_API}/users/signup`, userData);

  if (response.status === 200 || response.status === 201) {
    const { message, success } = response.data;

    if (!success) {
      throw new Error(message);
    }
  }
};

export const verifyEmailService = async (token: string) => {
  const response = await apiFetch.post(
    `${DASH_API}/users/verifyEmail`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 200 || response.status === 201) {
    const { message, success } = response.data;

    if (!success) {
      throw new Error(message);
    }
  }
};

export const getUserData = async (token: string) => {
  const response = await apiFetch(`${DASH_API}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 200 || response.status === 201) {
    return response.data.data;
  }
};
