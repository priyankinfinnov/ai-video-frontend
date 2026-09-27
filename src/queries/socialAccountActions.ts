import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services';
import { API_BASE, COOKIE_NAMES } from '@/constants/constants';
import { SocialPlatform, OAuthUrlResponse } from '@/types/socialAccount';
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

export const useInitiateOAuthMutation = (token?: string | null) => {
  return useMutation({
    mutationKey: ['initiateOAuth'],
    mutationFn: async ({
      platform,
      personaId,
      teamId: explicitTeamId,
    }: {
      platform: SocialPlatform;
      personaId: number | string;
      teamId?: number | string;
    }) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const teamId = explicitTeamId || extractTeamId(activeToken);
      const queryParams = new URLSearchParams({
        personaId: String(personaId),
        ...(teamId ? { teamId: String(teamId) } : {}),
      });

      let authUrl: string | undefined;

      try {
        const response = await apiFetch.get<OAuthUrlResponse>(
          `${API_BASE}/auth/${platform.toLowerCase()}/url?${queryParams.toString()}`
        );
        authUrl = response.data?.url;
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 404) {
          // Fallback to /authorize in case backend routes are mounted under /authorize
          const altResponse = await apiFetch.get<OAuthUrlResponse>(
            `${API_BASE}/auth/${platform.toLowerCase()}/authorize?${queryParams.toString()}`
          );
          authUrl = altResponse.data?.url;
        } else {
          throw err;
        }
      }

      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error('OAuth authorization URL was not returned by server');
      }
      return { url: authUrl };
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
        'Failed to initiate social account authorization';
      toast.error(message);
    },
  });
};

export const useDisconnectSocialAccountMutation = (
  personaId?: number | string,
  token?: string | null,
  teamId?: number | string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['disconnectSocialAccount', personaId],
    mutationFn: async ({ platform }: { platform: SocialPlatform }) => {
      const activeToken = token || getCookieValue(COOKIE_NAMES.TOKEN);
      const resolvedTeamId = teamId || extractTeamId(activeToken);
      const teamQuery = resolvedTeamId ? `?teamId=${resolvedTeamId}` : '';

      const response = await apiFetch.delete(
        `${API_BASE}/personas/${personaId}/social-accounts/${platform}${teamQuery}`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['socialAccounts', personaId]);
      queryClient.invalidateQueries(['socialAccounts', String(personaId)]);
      toast.success(
        `Disconnected ${
          variables.platform === 'YOUTUBE' ? 'YouTube' : 'Instagram'
        } account`
      );
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
        'Failed to disconnect account';
      toast.error(message);
    },
  });
};
