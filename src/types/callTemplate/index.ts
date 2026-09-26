import { ColumnDef } from '@tanstack/react-table';

type PromptVariableType = { _id: string; key: string; defaultValue: string };
type SingleResultTemplatesType = {
  question: string;
  columnName: string;
  resultType: string;
  _id: string;
};

type CallTemplateType = {
  _id?: string;
  teamId?: string;
  voiceId?: string;
  status?: 'live' | 'paused';
  nameOfAI: string;
  promptObjectiveText: string;
  promptContextText: string;
  callTemplateName: string;
  createdAt?: Date;
  updatedAt?: Date;
  resultTemplates: SingleResultTemplatesType[];
  promptVariables: PromptVariableType[];
};

type CallTemplateRowType = {
  _id: string;
  callTemplateName: string;
  promptObjectiveText: string;
  nameOfAI: string;
  createdAt: Date;
};

interface DataTableType<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export type {
  PromptVariableType,
  SingleResultTemplatesType,
  CallTemplateType,
  CallTemplateRowType,
  DataTableType,
};
