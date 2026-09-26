import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateShortsProjectRequest,
} from '@/types/project';
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

export const useCreateProjectMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createProject'],
    mutationFn: async (payload: CreateProjectRequest) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const body = {
        ...payload,
        ...(teamId ? { teamId } : {}),
      };

      const response = await apiFetch.post(`${API_BASE}/projects`, body);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects']);
      await queryClient.refetchQueries(['projects']);
      toast.success('Video project created successfully!');
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
        'Failed to create video project';
      toast.error(message);
    },
  });
};

export const useUpdateProjectMutation = (
  id?: number | string,
  token?: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateProject', id],
    mutationFn: async (payload: UpdateProjectRequest) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const body = {
        ...payload,
        ...(teamId ? { teamId } : {}),
      };

      const teamQuery = teamId ? `?teamId=${teamId}` : '';
      const response = await apiFetch.patch(
        `${API_BASE}/projects/${id}${teamQuery}`,
        body
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects']);
      await queryClient.refetchQueries(['projects']);
      await queryClient.invalidateQueries(['project', id]);
      toast.success('Video project updated successfully!');
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
        'Failed to update video project';
      toast.error(message);
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteProject'],
    mutationFn: async (id: number | string) => {
      const activeToken = getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);
      const teamQuery = teamId ? `?teamId=${teamId}` : '';

      const response = await apiFetch.delete(
        `${API_BASE}/projects/${id}${teamQuery}`
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['projects']);
      await queryClient.refetchQueries(['projects']);
      await queryClient.invalidateQueries(['shorts-projects']);
      toast.success('Video project deleted successfully!');
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
        'Failed to delete video project';
      toast.error(message);
    },
  });
};

export const useCreateShortsProjectMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createShortsProject'],
    mutationFn: async (payload: CreateShortsProjectRequest) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const body = {
        ...payload,
        ...(teamId ? { teamId } : {}),
      };

      const response = await apiFetch.post(`${API_BASE}/shorts-projects`, body);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['shorts-projects']);
      await queryClient.refetchQueries(['shorts-projects']);
      toast.success('Shorts project created successfully!');
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
        'Failed to create shorts project';
      toast.error(message);
    },
  });
};

export const useDeleteShortsProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteShortsProject'],
    mutationFn: async (id: number | string) => {
      const activeToken = getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);
      const teamQuery = teamId ? `?teamId=${teamId}` : '';

      const response = await apiFetch.delete(
        `${API_BASE}/shorts-projects/${id}${teamQuery}`
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(['shorts-projects']);
      await queryClient.refetchQueries(['shorts-projects']);
      toast.success('Shorts project deleted successfully!');
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
        'Failed to delete shorts project';
      toast.error(message);
    },
  });
};
