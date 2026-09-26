export type ProjectType =
  | 'FULL_AI_GENERATED_VIDEO'
  | 'AUDIOBOOK'
  | 'TALKING_HEAD_VIDEO'
  | 'REMOTION_VIDEO';

export type ProjectLanguage = 'ENGLISH' | 'GERMAN' | 'SPANISH';

export type ProjectStatus =
  | 'PENDING'
  | 'GENERATING_SCRIPT'
  | 'SCRIPT_GENERATED'
  | 'GENERATING_AUDIO'
  | 'AUDIO_GENERATED'
  | 'GENERATING_VIDEO'
  | 'VIDEO_GENERATED'
  | 'COMPLETED'
  | 'FAILED';

export interface VideoProject {
  id: number;
  teamId: number;
  personaId: number;
  rawInputText: string;
  generatedScript?: string | null;
  roughLengthInMins?: number | null;
  wordCount?: number | null;
  type: ProjectType;
  language: ProjectLanguage;
  status: string;
  isPublished: boolean;
  publishedLink?: string | null;
  scriptGenSec?: number | null;
  partsSplittingSec?: number | null;
  ttsRewriteSec?: number | null;
  partsCreationSec?: number | null;
  totalAudioGenSec?: number | null;
  totalVideoGenSec?: number | null;
  upscaleGenSec?: number | null;
  subtitlesGenSec?: number | null;
  exportDirectory?: string | null;
  createdAt: string;
  updatedAt: string;
  persona?: {
    id: number;
    name: string;
  };
  parts?: unknown[];
}


export interface CreateProjectRequest {
  personaId: number;
  teamId?: number;
  rawInputText?: string;
  generatedScript?: string | null;
  roughLengthInMins?: number;
  type?: ProjectType;
  language?: ProjectLanguage;
  isPublished?: boolean;
  publishedLink?: string | null;
}

export interface UpdateProjectRequest {
  isPublished?: boolean;
  publishedLink?: string | null;
  rawInputText?: string;
  roughLengthInMins?: number;
  teamId?: number;
}

export interface ShortsProject {
  id: number;
  teamId: number;
  videoProjectId: number;
  status: string;
  transcript?: string | null;
  llmRawOutput?: string | null;
  llmVerifiedOutput?: string | null;
  errorMessage?: string | null;
  transcribeSec?: number | null;
  llmSearchSec?: number | null;
  llmVerifySec?: number | null;
  totalRenderSec?: number | null;
  exportDirectory?: string | null;
  createdAt: string;
  updatedAt: string;
  videoProject?: VideoProject;
  clips?: unknown[];
}


export interface CreateShortsProjectRequest {
  videoProjectId: number;
  teamId?: number;
}

export interface ProjectFilterState {
  search: string;
  type?: string;
  status?: string;
  page: number;
  limit: number;
}
