import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateShortsProjectRequest,
  UploadProjectRequest,
  UploadShortsClipRequest,
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

export interface UploadErrorInfo {
  statusCode?: number;
  message: string;
  isAccountNotLinked: boolean;
  isNotCompleted: boolean;
  isAlreadyUploading: boolean;
  isNotFound: boolean;
}

export function parseUploadError(
  err: unknown,
  assetType: 'project' | 'clip' = 'project'
): UploadErrorInfo {
  const error = err as {
    response?: {
      status?: number;
      data?: {
        message?: string;
        error?: string;
        statusCode?: number;
      };
    };
    message?: string;
  };

  const status = error.response?.status || error.response?.data?.statusCode;
  const rawMsg =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    '';

  const lower = rawMsg.toLowerCase();
  const isAccountNotLinked =
    status === 400 &&
    (lower.includes('account') ||
      lower.includes('connect') ||
      lower.includes('social') ||
      lower.includes('link') ||
      lower.includes('oauth') ||
      lower.includes('auth'));

  const isNotCompleted =
    status === 400 &&
    (lower.includes('completed') || lower.includes('state') || lower.includes('status'));

  const isAlreadyUploading =
    status === 409 ||
    lower.includes('currently being uploaded') ||
    lower.includes('already uploading');

  const isNotFound = status === 404;

  let message = rawMsg || 'Failed to trigger upload';

  if (isAlreadyUploading) {
    message = 'Asset is currently already uploading. Please wait for the current upload to finish.';
  } else if (isNotFound) {
    message = `${assetType === 'project' ? 'Project' : 'Clip'} ID not found in the active team.`;
  } else if (isAccountNotLinked) {
    message = 'Persona has not linked the required platform account yet. Please connect your account in Social Settings.';
  } else if (isNotCompleted) {
    message = `${assetType === 'project' ? 'Project' : 'Clip'} is not in COMPLETED state.`;
  }

  return {
    statusCode: status,
    message,
    isAccountNotLinked,
    isNotCompleted,
    isAlreadyUploading,
    isNotFound,
  };
}

export interface UploadProjectMutationParams {
  id: number | string;
  payload?: UploadProjectRequest;
}

export const useUploadProjectMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['uploadProject'],
    mutationFn: async ({ id, payload = {} }: UploadProjectMutationParams) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const body = {
        platform: 'YOUTUBE',
        uploadType: 'DRAFT',
        ...payload,
        ...(teamId ? { teamId } : {}),
      };

      const teamQuery = teamId ? `?teamId=${teamId}` : '';
      const response = await apiFetch.post(
        `${API_BASE}/projects/${id}/upload${teamQuery}`,
        body
      );
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries(['project', String(variables.id)]);
      await queryClient.invalidateQueries(['project', Number(variables.id)]);
      await queryClient.invalidateQueries(['projects']);
      toast.success('Project uploaded to YouTube successfully!');
    },
    onError: (err: unknown) => {
      const info = parseUploadError(err, 'project');
      toast.error(info.message);
    },
  });
};

export interface UploadShortsClipMutationParams {
  id: number | string;
  payload: UploadShortsClipRequest;
}

export const useUploadShortsClipMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['uploadShortsClip'],
    mutationFn: async ({ id, payload }: UploadShortsClipMutationParams) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = extractTeamId(activeToken);

      const body = {
        uploadType: 'ACTUAL_POST',
        ...payload,
        ...(teamId ? { teamId } : {}),
      };

      const teamQuery = teamId ? `?teamId=${teamId}` : '';
      const response = await apiFetch.post(
        `${API_BASE}/shorts-clips/${id}/upload${teamQuery}`,
        body
      );
      return response.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries(['shorts-clips']);
      await queryClient.invalidateQueries(['shorts-project']);
      await queryClient.invalidateQueries(['shorts-projects']);
      await queryClient.invalidateQueries(['project']);
      const platformName = variables.payload.platform === 'YOUTUBE' ? 'YouTube Shorts' : 'Instagram Reels';
      toast.success(`Shorts clip uploaded to ${platformName} successfully!`);
    },
    onError: (err: unknown) => {
      const info = parseUploadError(err, 'clip');
      toast.error(info.message);
    },
  });
};
