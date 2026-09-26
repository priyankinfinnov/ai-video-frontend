export interface Persona {
  id: number;
  teamId: number;
  name: string;
  topics: string[];
  characterSheetPath?: string | null;
  headPicturePath?: string | null;
  referenceAudioPath?: string | null;
  writingDnaPath?: string | null;
  visualDnaPath?: string | null;
  scriptPromptPath?: string | null;
  videoPromptPath?: string | null;
  scriptJudgePath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonaRequest {
  name: string;
  topics: string[];
  characterSheetPath?: string | null;
  headPicturePath?: string | null;
  referenceAudioPath?: string | null;
  writingDnaPath?: string | null;
  visualDnaPath?: string | null;
  scriptPromptPath?: string | null;
  videoPromptPath?: string | null;
  scriptJudgePath?: string | null;
}

export interface UpdatePersonaRequest extends Partial<CreatePersonaRequest> {}

export interface PersonaFilterState {
  search: string;
  page: number;
  limit: number;
}
