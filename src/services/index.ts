import axios from 'axios';

export const apiFetch = axios.create({
  baseURL: 'http://localhost:6001',
  headers: {
    Accept: 'application/json',
  },
});
