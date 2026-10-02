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
