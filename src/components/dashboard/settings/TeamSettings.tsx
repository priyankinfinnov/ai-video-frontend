import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useAppSelector } from '@/store/store';
import {
  useGetCurrentTeamQuery,
  useGetTeamMembersQuery,
} from '@/queries/teamQueries';
import {
  useAddTeamMemberMutation,
  useUpdateUserStatusMutation,
} from '@/queries/teamActions';
import { TeamMember } from '@/types/team';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/common/DataTable';
import { DataTableFilterBar } from '@/components/common/DataTableFilterBar';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { useDataTableFilters } from '@/hooks/useDataTableFilters';
import { PATTERN_REGEX } from '@/constants/constants';
import toast from 'react-hot-toast';
import {
  UsersIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  BuildingIcon,
  FilmIcon,
  ScissorsIcon,
  UserCheckIcon,
  UserXIcon,
} from 'lucide-react';

export const TeamSettings: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const currentUser = useAppSelector((store) => store.auth.userInfo);

  const { data: teamDetails, isLoading: isTeamLoading } =
    useGetCurrentTeamQuery();

  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialLimit: 10 });

  const { data: membersResponse, isLoading: isMembersLoading } =
    useGetTeamMembersQuery({ page, limit });

  const addMemberMutation = useAddTeamMemberMutation();
  const updateUserStatusMutation = useUpdateUserStatusMutation();

  // Combine members from teamDetails or paginated members query
  const rawMembers = membersResponse?.data || teamDetails?.members || [];

  // Filter client-side by debounced search string if entered
  const filteredMembers = useMemo(() => {
    if (!debouncedSearch) return rawMembers;
    const q = debouncedSearch.toLowerCase();
    return rawMembers.filter((m) => {
      const name = (
        m.name ||
        [m.firstName, m.lastName].filter(Boolean).join(' ')
      ).toLowerCase();
      const email = m.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [rawMembers, debouncedSearch]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inviteEmail.trim();

    if (!cleanEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (!PATTERN_REGEX.email.test(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!teamDetails?.id) {
      toast.error('Team information not loaded yet.');
      return;
    }

    await addMemberMutation.mutateAsync({
      email: cleanEmail,
      teamId: teamDetails.id,
    });

    setInviteEmail('');
  };

  const handleToggleStatus = (member: TeamMember) => {
    const newStatus = !member.isEnabled;
    updateUserStatusMutation.mutate({
      userId: member.id,
      isEnabled: newStatus,
    });
  };

  const isAdmin = currentUser?.id === teamDetails?.adminUserId;

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className='font-mono text-xs text-gray-500'>
            #{row.getValue('id')}
          </span>
        ),
      },
      {
        id: 'member',
        header: 'Team Member',
        cell: ({ row }) => {
          const m = row.original;
          const name =
            m.name ||
            [m.firstName, m.lastName].filter(Boolean).join(' ') ||
            'Member';
          const initial = name.charAt(0).toUpperCase();

          return (
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs flex items-center justify-center shrink-0'>
                {initial}
              </div>
              <div>
                <div className='font-semibold text-gray-900 text-sm'>
                  {name}
                </div>
                <div className='text-xs text-gray-500'>{m.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const m = row.original;
          const isTeamAdmin = m.id === teamDetails?.adminUserId;

          return isTeamAdmin ? (
            <span className='inline-flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full'>
              <ShieldCheckIcon className='w-3.5 h-3.5' /> Team Admin
            </span>
          ) : (
            <span className='inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full'>
              Member
            </span>
          );
        },
      },
      {
        accessorKey: 'isEnabled',
        header: 'Status',
        cell: ({ row }) => {
          const isEnabled = row.getValue('isEnabled') !== false;
          return isEnabled ? (
            <Badge variant='default' className='bg-emerald-100 text-emerald-800 hover:bg-emerald-200'>
              <UserCheckIcon className='w-3 h-3 mr-1' /> Active
            </Badge>
          ) : (
            <Badge variant='destructive' className='bg-rose-100 text-rose-800 hover:bg-rose-200'>
              <UserXIcon className='w-3 h-3 mr-1' /> Disabled
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const member = row.original;
          const isCurrentTargetAdmin = member.id === teamDetails?.adminUserId;

          if (!isAdmin || isCurrentTargetAdmin) {
            return (
              <span className='text-xs text-gray-400 italic'>
                {isCurrentTargetAdmin ? 'Owner' : 'No access'}
              </span>
            );
          }

          const isEnabled = member.isEnabled !== false;

          return (
            <Button
              variant='tertiary-gray'
              size='sm'
              disabled={updateUserStatusMutation.isLoading}
              onClick={() => handleToggleStatus(member)}
              className={`text-xs h-7 px-2.5 rounded-lg border ${
                isEnabled
                  ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                  : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {isEnabled ? 'Disable' : 'Enable'}
            </Button>
          );
        },
      },
    ],
    [teamDetails?.adminUserId, isAdmin, updateUserStatusMutation.isLoading]
  );

  return (
    <div className='space-y-6 max-w-5xl'>
      {/* Team Details Overview Header */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm shrink-0'>
              <BuildingIcon className='w-6 h-6' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>
                {teamDetails?.name || 'Workspace Team'}
              </h2>
              <p className='text-sm text-gray-500'>
                Manage team members, roles, and asset distribution
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <span className='text-xs text-gray-400 block'>Team ID</span>
              <span className='font-mono text-sm font-semibold text-gray-800'>
                #{teamDetails?.id || '1'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          <div className='bg-gray-50 rounded-lg p-3.5 border border-gray-100 flex items-center gap-3'>
            <UsersIcon className='w-5 h-5 text-primary-600' />
            <div>
              <div className='text-xs text-gray-500 font-medium'>Members</div>
              <div className='text-lg font-bold text-gray-900'>
                {filteredMembers.length}
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-3.5 border border-gray-100 flex items-center gap-3'>
            <UsersIcon className='w-5 h-5 text-indigo-600' />
            <div>
              <div className='text-xs text-gray-500 font-medium'>Personas</div>
              <div className='text-lg font-bold text-gray-900'>
                {teamDetails?.stats?.personasCount ?? 0}
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-3.5 border border-gray-100 flex items-center gap-3'>
            <FilmIcon className='w-5 h-5 text-blue-600' />
            <div>
              <div className='text-xs text-gray-500 font-medium'>Projects</div>
              <div className='text-lg font-bold text-gray-900'>
                {teamDetails?.stats?.projectsCount ?? 0}
              </div>
            </div>
          </div>

          <div className='bg-gray-50 rounded-lg p-3.5 border border-gray-100 flex items-center gap-3'>
            <ScissorsIcon className='w-5 h-5 text-purple-600' />
            <div>
              <div className='text-xs text-gray-500 font-medium'>Shorts</div>
              <div className='text-lg font-bold text-gray-900'>
                {teamDetails?.stats?.shortsCount ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Team Member Card */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4'>
        <div className='flex items-center gap-2 border-b border-gray-100 pb-3'>
          <UserPlusIcon className='w-5 h-5 text-primary-600' />
          <h3 className='font-semibold text-gray-900 text-base'>
            Add Team Member
          </h3>
        </div>

        <form onSubmit={handleAddMember} className='flex flex-col sm:flex-row gap-3'>
          <div className='flex-1'>
            <Input
              type='email'
              placeholder='Enter collaborator email address...'
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className='h-10 text-sm'
            />
          </div>
          <Button
            type='submit'
            disabled={addMemberMutation.isLoading}
            className='bg-primary-600 text-white hover:bg-primary-700 h-10 px-5 gap-2 shrink-0'
          >
            <UserPlusIcon className='w-4 h-4' />
            {addMemberMutation.isLoading ? 'Adding...' : 'Add Member'}
          </Button>
        </form>
      </div>

      {/* Team Roster Table Card */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4'>
        <div className='flex items-center justify-between border-b border-gray-100 pb-3'>
          <div className='flex items-center gap-2'>
            <UsersIcon className='w-5 h-5 text-primary-600' />
            <h3 className='font-semibold text-gray-900 text-base'>Team Roster</h3>
          </div>
          <span className='text-xs text-gray-500 font-medium'>
            Total {filteredMembers.length} member(s)
          </span>
        </div>

        <DataTableFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder='Filter team members by name or email...'
        />

        <DataTable
          columns={columns}
          data={filteredMembers}
          isLoading={isMembersLoading || isTeamLoading}
          emptyMessage='No team members found.'
        />

        <DataTablePagination
          pagination={membersResponse?.pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>
    </div>
  );
};

export default TeamSettings;
