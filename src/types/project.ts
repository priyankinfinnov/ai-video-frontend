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

export type PartAssetStatus =
  | 'PENDING'
  | 'GENERATING'
  | 'COMPLETED'
  | 'FAILED';

export type AssetType =
  | 'IMAGE'
  | 'VIDEO'
  | 'TALKING_HEAD'
  | 'REMOTION';

export type ShortsProjectStatus =
  | 'PENDING'
  | 'TRANSCRIBING'
  | 'SEGMENT_SEARCH_IN_PROGRESS'
  | 'VERIFYING'
  | 'CLIPS_IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export type ShortsClipStatus =
  | 'PENDING'
  | 'CARVING_IN_PROGRESS'
  | 'BURNING_SUBTITLES_IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export interface VideoPartAsset {
  id: number;
  teamId: number;
  projectId: number;
  videoPartId: number;
  assetType: AssetType;
  prompt?: string | null;
  generationPromptText?: string | null;
  path?: string | null;
  status: PartAssetStatus;
  desiredDuration?: number | null;
  promptGenSec?: number | null;
  genSec?: number | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  videoPart?: VideoPart;
}

export interface VideoPart {
  id: number;
  teamId: number;
  projectId: number;
  personaId: number;
  sequenceNumber: number;
  partText: string;
  ttsText?: string | null;
  audioPath?: string | null;
  audioStatus: PartAssetStatus;
  audioGenSec?: number | null;
  audioDuration?: number | null;
  wordTimestamps?: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  assets?: VideoPartAsset[];
  persona?: {
    id: number;
    name: string;
  };
}

export interface ScriptIterationLog {
  id: number;
  teamId: number;
  projectId: number;
  attemptNumber: number;
  scriptText: string;
  verdict?: string | null;
  score?: number | null;
  judgeFeedback?: string | null;
  judgeGenSec?: number | null;
  createdAt: string;
}

export interface ShortsClip {
  id: number;
  teamId: number;
  shortsProjectId: number;
  title: string;
  shortsTranscript: string;
  viralityReason?: string | null;
  segments?: unknown;
  status: ShortsClipStatus;
  videoPath?: string | null;
  rawVideoPath?: string | null;
  subtitlesPath?: string | null;
  duration?: number | null;
  renderSec?: number | null;
  subtitlesSec?: number | null;
  retryCount: number;
  errorMessage?: string | null;
  youtubeStatus?: string | null;
  youtubeUrl?: string | null;
  instagramStatus?: string | null;
  instagramUrl?: string | null;
  instagramMediaId?: string | null;
  createdAt: string;
  updatedAt: string;
  shortsProject?: ShortsProject;
}

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
  youtubeStatus?: string | null;
  youtubeVideoId?: string | null;
  youtubeUrl?: string | null;
  youtubeStudioUrl?: string | null;
  youtubeUploadedAt?: string | null;
  youtubeErrorMessage?: string | null;
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
  parts?: VideoPart[];
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
  generatedScript?: string | null;
  roughLengthInMins?: number;
  teamId?: number;
  type?: ProjectType;
  language?: ProjectLanguage;
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
  clips?: ShortsClip[];
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

export interface UploadProjectRequest {
  teamId?: number;
  platform?: 'YOUTUBE';
  uploadType?: 'DRAFT' | 'ACTUAL_POST';
  customTitle?: string;
  customTags?: string[];
  titlePrefix?: string;
}

export interface UploadShortsClipRequest {
  teamId?: number;
  platform: 'YOUTUBE' | 'INSTAGRAM';
  uploadType?: 'DRAFT' | 'ACTUAL_POST';
  customTitle?: string;
  customCaption?: string;
  customTags?: string[];
}
