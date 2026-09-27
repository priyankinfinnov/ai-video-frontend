export type AutomationPlatform = 'YOUTUBE' | 'INSTAGRAM';
export type AutomationTarget = 'PROJECT' | 'SHORTS_CLIP';
export type AutomationUploadType = 'DRAFT' | 'PUBLISH';
export type AutomationFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY';
export type AutomationLastRunStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'FAILED'
  | 'PENDING'
  | 'SKIPPED'
  | string;

export interface Automation {
  id: number;
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
  isEnabled: boolean;
}

export interface UpdateAutomationRequest {
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
