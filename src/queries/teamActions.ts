import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/services';
import { API_BASE } from '@/constants/constants';
import { AddTeamMemberPayload, UpdateUserStatusPayload } from '@/types/team';

export const useAddTeamMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['addTeamMember'],
    mutationFn: async (payload: AddTeamMemberPayload) => {
      const response = await apiFetch.post(
        `${API_BASE}/teams/members`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentTeam']);
      queryClient.invalidateQueries(['teamMembers']);
      toast.success('Team member added successfully!');
    },
    onError: (err: unknown) => {
      const error = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to add team member';
      toast.error(message);
    },
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateUserStatus'],
    mutationFn: async ({ userId, isEnabled }: UpdateUserStatusPayload) => {
      const response = await apiFetch.patch(
        `${API_BASE}/users/${userId}/status`,
        { isEnabled }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['currentTeam']);
      queryClient.invalidateQueries(['teamMembers']);
      toast.success(
        `User ${variables.isEnabled ? 'enabled' : 'disabled'} successfully!`
      );
    },
    onError: (err: unknown) => {
      const error = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update user status';
      toast.error(message);
    },
  });
};
