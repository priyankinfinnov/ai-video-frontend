import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import {
  CreateAutomationRequest,
  UpdateAutomationRequest,
  TriggerAutomationResponse,
} from '@/types/automation';
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

export const useCreateAutomationMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createAutomation'],
    mutationFn: async (payload: CreateAutomationRequest) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = payload.teamId ?? extractTeamId(activeToken);

      const targetType =
        payload.target === 'PROJECT' ? 'LONG_FORM_VIDEO' : payload.target;
      const uploadType =
        payload.uploadType === 'PUBLISH' ? 'ACTUAL_POST' : payload.uploadType;

      const body = {
        ...payload,
        targetType,
        uploadType,
        ...(teamId ? { teamId } : {}),
      };

      const response = await apiFetch.post(`${API_BASE}/automations`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automations']);
      toast.success('Automation rule created successfully!');
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
        'Failed to create automation rule';
      toast.error(message);
    },
  });
};

export const useUpdateAutomationMutation = (
  id?: number | string,
  token?: string | null
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateAutomation', id],
    mutationFn: async ({
      id: overrideId,
      ...payload
    }: Partial<UpdateAutomationRequest> & { id?: number | string }) => {
      const targetId = overrideId || id;
      if (!targetId) throw new Error('Missing automation ID');

      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = payload.teamId ?? extractTeamId(activeToken);

      const targetType = payload.target
        ? payload.target === 'PROJECT'
          ? 'LONG_FORM_VIDEO'
          : payload.target
        : undefined;

      const uploadType = payload.uploadType
        ? payload.uploadType === 'PUBLISH'
          ? 'ACTUAL_POST'
          : payload.uploadType
        : undefined;

      const body = {
        ...payload,
        ...(targetType ? { targetType } : {}),
        ...(uploadType ? { uploadType } : {}),
        ...(teamId ? { teamId } : {}),
      };

      const response = await apiFetch.patch(
        `${API_BASE}/automations/${targetId}`,
        body
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automations']);
      queryClient.invalidateQueries(['automation', id]);
      toast.success('Automation updated successfully!');
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
        'Failed to update automation';
      toast.error(message);
    },
  });
};

export const useDeleteAutomationMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteAutomation'],
    mutationFn: async (id: number | string) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);
      const teamQuery = teamId ? `?teamId=${teamId}` : '';

      const response = await apiFetch.delete(
        `${API_BASE}/automations/${id}${teamQuery}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automations']);
      toast.success('Automation rule deleted');
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
        'Failed to delete automation';
      toast.error(message);
    },
  });
};

export const useTriggerAutomationMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['triggerAutomation'],
    mutationFn: async (id: number | string) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const response = await apiFetch.post<TriggerAutomationResponse>(
        `${API_BASE}/automations/${id}/trigger`,
        { teamId }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['automations']);
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['shortsProjects']);
      queryClient.invalidateQueries(['shortsClips']);
      const msg = data?.result?.message || data?.message || 'Automation triggered successfully!';
      toast.success(msg, { duration: 4000 });
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
        'Failed to trigger automation';
      toast.error(message);
    },
  });
};
