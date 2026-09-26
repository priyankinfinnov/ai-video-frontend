import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import { CreatePersonaRequest, UpdatePersonaRequest } from '@/types/persona';
import { getCookieValue } from '@/utils/utils';

function extractTeamId(token: string | null): number | undefined {
  if (!token) return undefined;
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const json =
      typeof atob !== 'undefined'
        ? atob(payload)
        : Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(json).teamId;
  } catch {
    return undefined;
  }
}

export const useCreatePersonaMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createPersona'],
    mutationFn: async (payload: CreatePersonaRequest) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const body = {
        ...payload,
        ...(teamId ? { teamId } : {}),
      };

      const response = await apiFetch.post(`${API_BASE}/personas`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personas']);
      toast.success('Persona created successfully!');
    },
    onError: (err: unknown) => {
      const error = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create persona';
      toast.error(message);
    },
  });
};

export const useUpdatePersonaMutation = (
  id?: number | string,
  token?: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updatePersona', id],
    mutationFn: async (payload: UpdatePersonaRequest) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const body = {
        ...payload,
        ...(teamId ? { teamId } : {}),
      };

      const response = await apiFetch.patch(`${API_BASE}/personas/${id}`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personas']);
      queryClient.invalidateQueries(['persona', id]);
      toast.success('Persona updated successfully!');
    },
    onError: (err: unknown) => {
      const error = err as {
        response?: { status?: number; data?: { message?: string; error?: string } };
        message?: string;
      };
      if (error.response?.status === 404) {
        toast.error(
          'Backend update endpoint (PATCH /api/personas/:id) not yet implemented on server.'
        );
      } else {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to update persona';
        toast.error(message);
      }
    },
  });
};

export const useDeletePersonaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deletePersona'],
    mutationFn: async (id: number | string) => {
      const response = await apiFetch.delete(`${API_BASE}/personas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['personas']);
      toast.success('Persona deleted successfully!');
    },
    onError: (err: unknown) => {
      const error = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete persona';
      toast.error(message);
    },
  });
};
