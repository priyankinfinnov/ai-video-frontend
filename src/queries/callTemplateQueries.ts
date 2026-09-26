import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services';
import { DASH_API } from '@/constants/constants';
import { CallTemplateRowType, CallTemplateType } from '@/types/callTemplate';

// const useEditCallTemplateMutation = () =>
// if isAdding then call template will be null and enable is false, so no fetching
// if isEditing then call template will be string and enable is true, so fetch

// if there is no team, then teamId will be undefined.
type useGetCallTemplateQueryParamType = {
  token: string | null;
  callTemplateId: string | null;
  teamId: string | undefined;
};

type useGetAllCallTemplateQueryParamType = {
  token: string | null;
  teamId: string | undefined;
};

export const useGetCallTemplateQuery = ({
  token,
  callTemplateId,
  teamId,
}: useGetCallTemplateQueryParamType) =>
  useQuery<CallTemplateType>({
    queryKey: ['callTemplate', callTemplateId, teamId],
    queryFn: async () => {
      const response = await apiFetch(
        `${DASH_API}/callTemplates/${callTemplateId}?teamId=${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { data } = response.data;
      return data;
    },
    enabled: !!callTemplateId && !!teamId,
    refetchOnMount: true,
  });

export const useGetAllCallTemplateQuery = ({
  token,
  teamId,
}: useGetAllCallTemplateQueryParamType) =>
  useQuery<CallTemplateRowType[]>({
    queryKey: ['allCallTemplate', teamId],
    queryFn: async () => {
      const response = await apiFetch(
        `${DASH_API}/callTemplates?teamId=${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { data }: { data: CallTemplateRowType[] } = response.data;

      return data.map(
        ({
          _id,
          callTemplateName,
          promptObjectiveText,
          nameOfAI,
          createdAt,
        }) => ({
          _id,
          callTemplateName,
          promptObjectiveText,
          nameOfAI,
          createdAt,
        })
      );
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  });
