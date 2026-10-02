import { PaginationMeta } from './common';

export interface TeamMember {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string | null;
  isVerified?: boolean;
  isEnabled?: boolean;
  teamId?: number;
  teamName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamDetails {
  id: number;
  name: string;
  adminUserId?: number;
  createdAt?: string;
  updatedAt?: string;
  members?: TeamMember[];
  stats?: {
    personasCount?: number;
    projectsCount?: number;
    shortsCount?: number;
    automationsCount?: number;
  };
}

export interface AddTeamMemberPayload {
  email: string;
  teamId?: number;
}

export interface UpdateUserStatusPayload {
  userId: number;
  isEnabled: boolean;
}

export interface PaginatedMembersResponse {
  data: TeamMember[];
  pagination: PaginationMeta;
}
