import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import { VideoProject, ShortsProject } from '@/types/project';
import { PaginatedResponse } from '@/types/common';
import { getCookieValue } from '@/utils/utils';

interface UseGetProjectsParams {
  token?: string | null;
  page?: number;
  limit?: number;
}

interface UseGetProjectParams {
  token?: string | null;
  id?: number | string | null;
}

interface UseGetShortsProjectsParams {
  token?: string | null;
  videoProjectId?: number | null;
  page?: number;
  limit?: number;
}

interface UseGetShortsProjectParams {
  token?: string | null;
  id?: number | string | null;
}

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

export const useGetProjectsQuery = ({
  token,
  page = 1,
  limit = 10,
}: UseGetProjectsParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
  const teamId = extractTeamId(activeToken);

  return useQuery<PaginatedResponse<VideoProject>>({
    queryKey: ['projects', page, limit, teamId],
    queryFn: async () => {
      const teamQuery = teamId ? `&teamId=${teamId}` : '';
      const response = await apiFetch.get<PaginatedResponse<VideoProject>>(
        `${API_BASE}/projects?page=${page}&limit=${limit}${teamQuery}`
      );
      return response.data;
    },
    enabled: !!activeToken,
    keepPreviousData: true,
    refetchOnMount: true,
  });
};

export const useGetProjectQuery = ({ token, id }: UseGetProjectParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
  const teamId = extractTeamId(activeToken);

  return useQuery<VideoProject>({
    queryKey: ['project', id, teamId],
    queryFn: async () => {
      const teamQuery = teamId ? `?teamId=${teamId}` : '';
      const response = await apiFetch.get<{ project?: VideoProject } | VideoProject>(
        `${API_BASE}/projects/${id}${teamQuery}`
      );
      const data = response.data;
      if ('project' in data && data.project) {
        return data.project;
      }
      return data as VideoProject;
    },
    enabled: !!activeToken && !!id,
    refetchOnMount: true,
  });
};

export const useGetShortsProjectsQuery = ({
  token,
  videoProjectId,
  page = 1,
  limit = 10,
}: UseGetShortsProjectsParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
  const teamId = extractTeamId(activeToken);

  return useQuery<PaginatedResponse<ShortsProject>>({
    queryKey: ['shorts-projects', page, limit, teamId, videoProjectId],
    queryFn: async () => {
      const teamQuery = teamId ? `&teamId=${teamId}` : '';
      const videoQuery = videoProjectId ? `&videoProjectId=${videoProjectId}` : '';
      const response = await apiFetch.get<PaginatedResponse<ShortsProject>>(
        `${API_BASE}/shorts-projects?page=${page}&limit=${limit}${teamQuery}${videoQuery}`
      );
      return response.data;
    },
    enabled: !!activeToken,
    keepPreviousData: true,
    refetchOnMount: true,
  });
};

export const useGetShortsProjectQuery = ({
  token,
  id,
}: UseGetShortsProjectParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
  const teamId = extractTeamId(activeToken);

  return useQuery<ShortsProject>({
    queryKey: ['shorts-project', id, teamId],
    queryFn: async () => {
      const teamQuery = teamId ? `?teamId=${teamId}` : '';
      const response = await apiFetch.get<{ shortsProject?: ShortsProject } | ShortsProject>(
        `${API_BASE}/shorts-projects/${id}${teamQuery}`
      );
      const data = response.data;
      if ('shortsProject' in data && data.shortsProject) {
        return data.shortsProject;
      }
      return data as ShortsProject;
    },
    enabled: !!activeToken && !!id,
    refetchOnMount: true,
  });
};
