import axios from 'axios';
import { COOKIE_NAMES } from '@/constants/constants';
import { getCookieValue } from '@/utils/utils';

export const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_API_URL) {
    return import.meta.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:6001';
};

export const API_BASE_URL = getApiBaseUrl();

export const apiFetch = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

apiFetch.interceptors.request.use((config) => {
  const authHeader = config.headers.Authorization;
  let token: string | null = null;

  if (
    !authHeader ||
    authHeader === 'Bearer null' ||
    authHeader === 'Bearer undefined'
  ) {
    token = getCookieValue(COOKIE_NAMES.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        // Decode base64 payload in browser/node
        const jsonStr =
          typeof atob !== 'undefined'
            ? atob(payloadBase64)
            : Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const decoded = JSON.parse(jsonStr);

        if (decoded.teamId && !config.headers['X-Team-ID']) {
          config.headers['X-Team-ID'] = String(decoded.teamId);
        }
      }
    } catch {
      // ignore token decode failure
    }
  }

  return config;
});
