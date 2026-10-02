import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserIcon, BuildingIcon, SettingsIcon } from 'lucide-react';
import UserSettings from '@/components/dashboard/settings/UserSettings';
import TeamSettings from '@/components/dashboard/settings/TeamSettings';

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'user';

  const handleTabChange = (tab: 'user' | 'team') => {
    setSearchParams({ tab });
  };

  return (
    <div className='p-6 md:p-8 space-y-6 max-w-7xl mx-auto'>
      {/* Top Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5'>
        <div>
          <div className='flex items-center gap-2.5 text-gray-900'>
            <div className='p-2 rounded-lg bg-primary-50 text-primary-600'>
              <SettingsIcon className='w-6 h-6' />
            </div>
            <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
          </div>
          <p className='text-sm text-gray-500 mt-1 pl-11'>
            Manage your personal profile details and workspace team configurations.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className='flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 self-start md:self-auto'>
          <button
            onClick={() => handleTabChange('user')}
            data-testid='tab-user-settings'
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentTab === 'user'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <UserIcon className='w-4 h-4' />
            User Profile
          </button>

          <button
            onClick={() => handleTabChange('team')}
            data-testid='tab-team-settings'
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentTab === 'team'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BuildingIcon className='w-4 h-4' />
            Team & Workspace
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className='mt-6'>
        {currentTab === 'team' ? <TeamSettings /> : <UserSettings />}
      </div>
    </div>
  );
};

export default SettingsPage;
