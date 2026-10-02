import React from 'react';
import { useAppSelector } from '@/store/store';
import { Badge } from '@/components/ui/badge';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  ShieldCheckIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  HashIcon,
} from 'lucide-react';
import { getCreatedDate } from '@/utils/utils';

export const UserSettings: React.FC = () => {
  const userInfo = useAppSelector((store) => store.auth.userInfo);

  const displayName =
    userInfo?.name ||
    [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ') ||
    'User';

  const userInitial = displayName.charAt(0).toUpperCase();

  const formattedDate = userInfo?.createdAt
    ? getCreatedDate(userInfo.createdAt)
    : 'Recently';

  return (
    <div className='space-y-6 max-w-5xl'>
      {/* Profile Overview Header Card */}
      <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div className='flex items-center gap-5'>
          <div className='w-16 h-16 rounded-full bg-primary-700 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-primary-100 shadow-inner shrink-0'>
            {userInitial}
          </div>
          <div>
            <div className='flex items-center gap-3 flex-wrap'>
              <h2 className='text-xl font-bold text-gray-900'>{displayName}</h2>
              <Badge variant='default' className='bg-primary-100 text-primary-700 hover:bg-primary-200'>
                {userInfo?.teamName ? `${userInfo.teamName} Member` : 'User Account'}
              </Badge>
              {userInfo?.isVerified !== false ? (
                <span className='inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200'>
                  <CheckCircle2Icon className='w-3.5 h-3.5' /> Verified
                </span>
              ) : (
                <span className='inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200'>
                  <XCircleIcon className='w-3.5 h-3.5' /> Unverified
                </span>
              )}
            </div>
            <p className='text-sm text-gray-500 mt-1 flex items-center gap-2'>
              <MailIcon className='w-4 h-4 text-gray-400' /> {userInfo?.email}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 text-xs text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 self-start md:self-auto'>
          <CalendarIcon className='w-4 h-4 text-primary-600' />
          <span>Joined {formattedDate}</span>
        </div>
      </div>

      {/* Profile Details Sections */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Personal Details */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 border-b border-gray-100 pb-3'>
            <UserIcon className='w-5 h-5 text-primary-600' />
            <h3 className='font-semibold text-gray-900 text-base'>Personal Details</h3>
          </div>

          <div className='space-y-3.5 text-sm'>
            <div>
              <label className='text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1'>
                Full Name
              </label>
              <p className='font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                {displayName}
              </p>
            </div>

            <div>
              <label className='text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1'>
                Email Address
              </label>
              <div className='flex items-center gap-2 font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                <MailIcon className='w-4 h-4 text-gray-400 shrink-0' />
                <span className='truncate'>{userInfo?.email || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className='text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1'>
                Phone Number
              </label>
              <div className='flex items-center gap-2 font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                <PhoneIcon className='w-4 h-4 text-gray-400 shrink-0' />
                <span>{userInfo?.phoneNumber || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace & Security Info */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4'>
          <div className='flex items-center gap-2 border-b border-gray-100 pb-3'>
            <BuildingIcon className='w-5 h-5 text-primary-600' />
            <h3 className='font-semibold text-gray-900 text-base'>Workspace & Security</h3>
          </div>

          <div className='space-y-3.5 text-sm'>
            <div>
              <label className='text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1'>
                Primary Team Name
              </label>
              <p className='font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                {userInfo?.teamName || 'Default Workspace Team'}
              </p>
            </div>

            <div>
              <label className='text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1'>
                Account / User ID
              </label>
              <div className='flex items-center gap-2 font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 font-mono text-xs'>
                <HashIcon className='w-4 h-4 text-gray-400 shrink-0' />
                <span>{userInfo?.id || userInfo?._id || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className='text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1'>
                Security Status
              </label>
              <div className='flex items-center justify-between font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                <span className='flex items-center gap-2 text-xs'>
                  <ShieldCheckIcon className='w-4 h-4 text-emerald-600' />
                  JWT Session Authenticated
                </span>
                <span className='text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800'>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
