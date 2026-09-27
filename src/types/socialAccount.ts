export type SocialPlatform = 'YOUTUBE' | 'INSTAGRAM';

export interface SocialAccount {
  id: number;
  personaId: number;
  platform: SocialPlatform;
  accountId: string;
  accountName?: string | null;
  username?: string | null;
  profilePictureUrl?: string | null;
  accountPicture?: string | null;
  isConnected: boolean;
  tokenExpiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface OAuthUrlResponse {
  url: string;
}
