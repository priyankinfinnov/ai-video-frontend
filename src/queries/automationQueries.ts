import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import { Automation } from '@/types/automation';
import { PaginatedResponse } from '@/types/common';
import { getCookieValue } from '@/utils/utils';

interface UseGetAutomationsParams {
  token?: string | null;
  personaId?: number | string | null;
  page?: number;
  limit?: number;
  teamId?: number;
}

interface UseGetAutomationParams {
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

export const useGetAutomationsQuery = ({
  token,
  personaId,
  page = 1,
  limit = 50,
  teamId: explicitTeamId,
}: UseGetAutomationsParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
  const teamId = explicitTeamId ?? extractTeamId(activeToken);

  return useQuery<PaginatedResponse<Automation>>({
    queryKey: ['automations', { personaId, page, limit, teamId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (personaId) params.append('personaId', String(personaId));
      if (teamId) params.append('teamId', String(teamId));
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await apiFetch.get(
        `${API_BASE}/automations?${params.toString()}`
      );
      const res = response.data;
      if (Array.isArray(res)) {
        return {
          data: res,
          pagination: {
            page,
            limit,
            totalCount: res.length,
            totalPages: Math.ceil(res.length / limit) || 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) {
          return res as PaginatedResponse<Automation>;
        }
        if (Array.isArray(obj.automations)) {
          return {
            ...obj,
            data: obj.automations as Automation[],
          } as PaginatedResponse<Automation>;
        }
      }
      return {
        data: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    },
    enabled: !!activeToken,
    keepPreviousData: true,
    refetchOnMount: true,
  });
};

export const useGetAutomationQuery = ({
  token,
  id,
}: UseGetAutomationParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);

  return useQuery<Automation>({
    queryKey: ['automation', id],
    queryFn: async () => {
      const response = await apiFetch.get<{ automation?: Automation } | Automation>(
        `${API_BASE}/automations/${id}`
      );
      const data = response.data;
      if ('automation' in data && data.automation) {
        return data.automation;
      }
      return data as Automation;
    },
    enabled: !!activeToken && !!id,
    refetchOnMount: true,
  });
};
