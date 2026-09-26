// import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { apiFetch } from '@/services';
import { DASH_API } from '@/constants/constants';

export const useCreateCallTemplateMutation = (token: string | null) => {
  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  return useMutation({
    mutationKey: ['createCallTemplate'],
    mutationFn: async (templateData) => {
      await apiFetch.post(`${DASH_API}/callTemplates`, templateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      // refetch the get all call template query
      queryClient.refetchQueries(['allCallTemplate']);
      queryClient.refetchQueries(['callTemplate']);
      toast.success('Created Call Template');
    },
    onError: () => {
      toast.error(
        'Something went wrong while creating the call template, please try again.'
      );
    },
  });
};

export const useUpdateCallTemplateMutation = (
  callTemplateId: string,
  token: string | null
) => {
  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  return useMutation({
    mutationKey: ['updateCallTemplate', callTemplateId],
    mutationFn: async (templateData) => {
      await apiFetch.patch(
        `${DASH_API}/callTemplates/${callTemplateId}`,
        templateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      // refetch the get all call template query
      queryClient.refetchQueries(['allCallTemplate']);
      queryClient.refetchQueries(['callTemplate']);
      toast.success('Updated Call Template');

      // this will make sure, when you go back in the browser refetch the callTemplate data
      // navigate('/dashboard', { replace: true });
    },
    onError: () => {
      toast.error(
        'Something went wrong while updating the call template, please try again.'
      );
    },
  });
};
