import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import { SocialAccount } from '@/types/socialAccount';
import { getCookieValue } from '@/utils/utils';

interface UseGetSocialAccountsParams {
  token?: string | null;
  personaId?: number | string | null;
  teamId?: number | string | null;
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

function normalizeAccounts(list: unknown[], fallbackPersonaId: number | string): SocialAccount[] {
  return list.map((raw) => {
    const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const accountName = String(item.accountName || item.channelTitle || item.username || '');
    const username = String(item.username || item.accountName || '');
    const picture = item.profilePictureUrl || item.accountPicture || null;

    return {
      id: Number(item.id) || 0,
      personaId: Number(item.personaId) || Number(fallbackPersonaId) || 0,
      platform: (item.platform as SocialAccount['platform']) || 'YOUTUBE',
      accountId: String(item.accountId || ''),
      accountName,
      username: username || accountName,
      profilePictureUrl: picture ? String(picture) : null,
      accountPicture: picture ? String(picture) : null,
      isConnected: item.isConnected !== undefined ? Boolean(item.isConnected) : true,
      tokenExpiresAt: item.tokenExpiresAt ? String(item.tokenExpiresAt) : null,
      createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString(),
      updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
    };
  });
}

export const useGetSocialAccountsQuery = ({
  token,
  personaId,
  teamId: explicitTeamId,
}: UseGetSocialAccountsParams) => {
  const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
  const teamId = explicitTeamId || extractTeamId(activeToken);

  return useQuery<SocialAccount[]>({
    queryKey: ['socialAccounts', personaId, teamId],
    queryFn: async () => {
      const teamQuery = teamId ? `?teamId=${teamId}` : '';
      const response = await apiFetch.get(
        `${API_BASE}/personas/${personaId}/social-accounts${teamQuery}`
      );
      const res = response.data;
      if (Array.isArray(res)) {
        return normalizeAccounts(res, personaId || 0);
      }
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.data)) {
          return normalizeAccounts(obj.data, personaId || 0);
        }
        if (Array.isArray(obj.socialAccounts)) {
          return normalizeAccounts(obj.socialAccounts, personaId || 0);
        }
        if (Array.isArray(obj.accounts)) {
          return normalizeAccounts(obj.accounts, personaId || 0);
        }
      }
      return [];
    },
    enabled: !!activeToken && !!personaId,
    refetchOnMount: true,
  });
};
