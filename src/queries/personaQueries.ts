import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import { Persona } from '@/types/persona';
import { PaginatedResponse } from '@/types/common';
import { getCookieValue } from '@/utils/utils';

interface UseGetPersonasParams {
  token?: string | null;
  page?: number;
  limit?: number;
}

interface UseGetPersonaParams {
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

export const useGetPersonasQuery = ({
  token,
  page = 1,
  limit = 50,
}: UseGetPersonasParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
  const teamId = extractTeamId(activeToken);

  return useQuery<PaginatedResponse<Persona>>({
    queryKey: ['personas', page, limit, teamId],
    queryFn: async () => {
      const teamQuery = teamId ? `&teamId=${teamId}` : '';
      const response = await apiFetch.get<PaginatedResponse<Persona>>(
        `${API_BASE}/personas?page=${page}&limit=${limit}${teamQuery}`
      );
      return response.data;
    },
    enabled: !!activeToken,
    keepPreviousData: true,
    refetchOnMount: true,
  });
};

export const useGetPersonaQuery = ({ token, id }: UseGetPersonaParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);

  return useQuery<Persona>({
    queryKey: ['persona', id],
    queryFn: async () => {
      const response = await apiFetch.get<{ persona?: Persona } | Persona>(
        `${API_BASE}/personas/${id}`
      );
      const data = response.data;
      if ('persona' in data && data.persona) {
        return data.persona;
      }
      return data as Persona;
    },
    enabled: !!activeToken && !!id,
    refetchOnMount: true,
  });
};
