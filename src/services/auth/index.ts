import { InputStateType } from '@/types/auth';
import { apiFetch } from '..';
import { AUTH_API } from '@/constants/constants';
import UserType from '@/types/userType';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UserType;
  access_token?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface SignupResponse {
  message: string;
  user: UserType;
  team: {
    id: number;
    name: string;
    adminUserId: number;
  };
  verificationToken?: string;
  verificationUrl?: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: Partial<UserType>;
}

export const loginService = async (
  userData: LoginPayload | InputStateType
): Promise<LoginResponse> => {
  const response = await apiFetch.post<LoginResponse>(
    `${AUTH_API}/login`,
    userData
  );

  return response.data;
};

export const signupService = async (
  userData: SignupPayload | InputStateType
): Promise<SignupResponse> => {
  const response = await apiFetch.post<SignupResponse>(
    `${AUTH_API}/signup`,
    userData
  );

  return response.data;
};

export const verifyEmailService = async (
  token: string
): Promise<VerifyEmailResponse> => {
  const response = await apiFetch.post<VerifyEmailResponse>(
    `${AUTH_API}/verify`,
    { token }
  );

  return response.data;
};

export const getUserData = async (
  token: string
): Promise<UserType | undefined> => {
  const response = await apiFetch.get<{ user?: UserType; data?: UserType }>(
    `${AUTH_API}/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 200 || response.status === 201) {
    const rawUser = response.data.user || response.data.data;
    if (rawUser) {
      const teamIds = (
        rawUser.teamIds
          ? rawUser.teamIds.map(String)
          : rawUser.teamId
          ? [String(rawUser.teamId)]
          : []
      ) as string[];

      return {
        ...rawUser,
        teamIds,
      };
    }
    return rawUser;
  }
};
