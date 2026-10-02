import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import { getCookieValue } from '@/utils/utils';
import { TeamDetails, TeamMember } from '@/types/team';
import { PaginatedResponse } from '@/types/common';

interface UseGetTeamMembersParams {
  token?: string | null;
  page?: number;
  limit?: number;
}

export const useGetCurrentTeamQuery = (token?: string | null) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);

  return useQuery<TeamDetails>({
    queryKey: ['currentTeam'],
    queryFn: async () => {
      const response = await apiFetch.get<TeamDetails>(
        `${API_BASE}/teams/current`
      );
      return response.data;
    },
    enabled: !!activeToken,
    refetchOnMount: true,
  });
};

export const useGetTeamMembersQuery = ({
  token,
  page = 1,
  limit = 20,
}: UseGetTeamMembersParams = {}) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);

  return useQuery<PaginatedResponse<TeamMember>>({
    queryKey: ['teamMembers', page, limit],
    queryFn: async () => {
      const response = await apiFetch.get<PaginatedResponse<TeamMember>>(
        `${API_BASE}/users?page=${page}&limit=${limit}`
      );
      return response.data;
    },
    enabled: !!activeToken,
    keepPreviousData: true,
    refetchOnMount: true,
  });
};
