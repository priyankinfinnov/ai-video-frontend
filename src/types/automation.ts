export type AutomationPlatform = 'YOUTUBE' | 'INSTAGRAM';
export type AutomationTarget = 'PROJECT' | 'SHORTS_CLIP';
export type AutomationUploadType = 'DRAFT' | 'ACTUAL_POST' | 'PUBLISH';
export type AutomationFrequency =
  | 'IMMEDIATE'
  | 'HOURLY'
  | 'EVERY_X_HOURS'
  | 'DAILY'
  | 'WEEKLY'
  | 'MULTIPLE_TIMES_DAILY'
  | 'MULTIPLE_TIMES_WEEKLY'
  | string;
export type AutomationLastRunStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'FAILED'
  | 'PENDING'
  | 'SKIPPED'
  | string;

export interface Automation {
  id: number;
  name?: string | null;
  teamId?: number;
  personaId: number;
  platform: AutomationPlatform;
  target: AutomationTarget;
  targetType?: string;
  uploadType: AutomationUploadType;
  frequency: AutomationFrequency;
  timeRangeStart: string; // "HH:mm" (24h)
  timeRangeEnd: string; // "HH:mm" (24h)
  cooldownHours: number; // integer >= 1
  postsPerPeriod?: number; // max number of posts in frequency cycle (default 1)
  scheduledPostAt?: string | null;
  lastRunAt?: string | null;
  lastRunStatus?: AutomationLastRunStatus | null;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  persona?: {
    id: number;
    name: string;
  };
}

export interface CreateAutomationRequest {
  name?: string;
  teamId?: number;
  personaId: number;
  platform: AutomationPlatform;
  target: AutomationTarget;
  targetType?: string;
  uploadType: AutomationUploadType;
  frequency: AutomationFrequency;
  timeRangeStart: string;
  timeRangeEnd: string;
  cooldownHours: number;
  postsPerPeriod?: number;
  isEnabled: boolean;
}

export interface UpdateAutomationRequest {
  name?: string;
  teamId?: number;
  personaId?: number;
  platform?: AutomationPlatform;
  target?: AutomationTarget;
  targetType?: string;
  uploadType?: AutomationUploadType;
  frequency?: AutomationFrequency;
  timeRangeStart?: string;
  timeRangeEnd?: string;
  cooldownHours?: number;
  postsPerPeriod?: number;
  isEnabled?: boolean;
}

export interface TriggerAutomationResponse {
  message: string;
  result?: {
    success: boolean;
    message?: string;
    url?: string;
  };
}

export type AutomationRunStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'SKIPPED_NO_ASSETS'
  | 'PENDING'
  | 'IN_PROGRESS'
  | string;

export interface AutomationRun {
  id: number;
  teamId?: number;
  automationId: number;
  personaId: number;
  platform: AutomationPlatform | string;
  targetType: AutomationTarget | string;
  uploadType: AutomationUploadType | string;
  videoProjectId?: number | null;
  shortsClipId?: number | null;
  status: AutomationRunStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  title?: string | null;
  postUrl?: string | null;
  mediaId?: string | null;
  errorMessage?: string | null;
  isManualTrigger?: boolean;
  createdAt?: string;
  updatedAt?: string;
  persona?: {
    id: number;
    name: string;
  } | null;
  automation?: {
    id: number;
    name?: string | null;
  } | null;
  videoProject?: {
    id: number;
    rawInputText?: string | null;
  } | null;
  shortsClip?: {
    id: number;
    title?: string | null;
  } | null;
}

export interface GetAutomationRunsQueryParams {
  token?: string | null;
  personaId?: number;
  automationId?: number;
  platform?: AutomationPlatform;
  targetType?: AutomationTarget;
  uploadType?: AutomationUploadType;
  status?: AutomationRunStatus;
  search?: string;
  page?: number;
  limit?: number;
}

