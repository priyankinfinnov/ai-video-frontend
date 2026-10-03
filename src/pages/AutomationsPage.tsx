import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Zap, Sliders, Activity } from 'lucide-react';
import {
  Automation,
  AutomationPlatform,
  AutomationTarget,
  AutomationUploadType,
  AutomationRunStatus,
} from '@/types/automation';
import { Persona } from '@/types/persona';
import {
  useGetAutomationsQuery,
  useGetAutomationRunsQuery,
} from '@/queries/automationQueries';
import { useDeleteAutomationMutation } from '@/queries/automationActions';
import { useGetPersonasQuery } from '@/queries/personaQueries';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import {
  AutomationsDataTable,
  AutomationRunsDataTable,
  AutomationModal,
  AutomationDetailsModal,
} from '@/components/dashboard/automations';
import useDataTableFilters from '@/hooks/useDataTableFilters';
import { DataTableFilterBar, DataTablePagination } from '@/components/common';

export const AutomationsPage = () => {
  const token = useAppSelector((store) => store.auth.token);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'rules' | 'runs') || 'rules';
  const [activeTab, setActiveTab] = useState<'rules' | 'runs'>(initialTab);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [cloneAutomation, setCloneAutomation] = useState<Automation | null>(null);
  const [detailsAutomation, setDetailsAutomation] = useState<Automation | null>(null);

  // --- Rules Tab Filters & Pagination ---
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | 'ALL'>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<AutomationPlatform | 'ALL'>('ALL');
  const [selectedTarget, setSelectedTarget] = useState<AutomationTarget | 'ALL'>('ALL');
  const [selectedUploadType, setSelectedUploadType] = useState<AutomationUploadType | 'ALL'>('ALL');

  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 50 });

  // --- Runs Tab Filters & Pagination ---
  const [selectedRunPersonaId, setSelectedRunPersonaId] = useState<number | 'ALL'>('ALL');
  const [selectedRunPlatform, setSelectedRunPlatform] = useState<AutomationPlatform | 'ALL'>('ALL');
  const [selectedRunTarget, setSelectedRunTarget] = useState<AutomationTarget | 'ALL'>('ALL');
  const [selectedRunUploadType, setSelectedRunUploadType] = useState<AutomationUploadType | 'ALL'>('ALL');
  // Default filter for execution runs is 'SUCCESS' as per user requirement
  const [selectedRunStatus, setSelectedRunStatus] = useState<AutomationRunStatus | 'ALL'>('SUCCESS');

  const {
    page: runsPage,
    setPage: setRunsPage,
    limit: runsLimit,
    setLimit: setRunsLimit,
    search: runsSearch,
    setSearch: setRunsSearch,
    debouncedSearch: debouncedRunSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 50 });

  // Fetch personas for filter dropdowns
  const { data: personasResponse } = useGetPersonasQuery({
    token,
    page: 1,
    limit: 100,
  });
  const personas = personasResponse?.data || [];

  // Automations Rules query
  const {
    data: automationsResponse,
    isLoading: isLoadingRules,
  } = useGetAutomationsQuery({
    token,
    personaId: selectedPersonaId === 'ALL' ? undefined : selectedPersonaId,
    page,
    limit,
  });

  // Automations Runs query
  const {
    data: runsResponse,
    isLoading: isLoadingRuns,
  } = useGetAutomationRunsQuery({
    token,
    personaId: selectedRunPersonaId === 'ALL' ? undefined : selectedRunPersonaId,
    platform: selectedRunPlatform === 'ALL' ? undefined : selectedRunPlatform,
    targetType: selectedRunTarget === 'ALL' ? undefined : selectedRunTarget,
    uploadType: selectedRunUploadType === 'ALL' ? undefined : selectedRunUploadType,
    status: selectedRunStatus === 'ALL' ? undefined : selectedRunStatus,
    search: debouncedRunSearch.trim() || undefined,
    page: runsPage,
    limit: runsLimit,
  });

  const { mutateAsync: deleteAutomation } = useDeleteAutomationMutation(token);

  const automationsList = useMemo(
    () => automationsResponse?.data || [],
    [automationsResponse?.data]
  );
  const pagination = automationsResponse?.pagination;

  const runsList = useMemo(
    () => runsResponse?.data || [],
    [runsResponse?.data]
  );
  const runsPagination = runsResponse?.pagination;

  // Filter Rules client-side by search and dropdowns
  const filteredRulesData = useMemo(() => {
    return automationsList.filter((auto) => {
      if (selectedPlatform !== 'ALL' && auto.platform !== selectedPlatform) {
        return false;
      }
      if (selectedTarget !== 'ALL' && auto.target !== selectedTarget) {
        return false;
      }
      if (selectedUploadType !== 'ALL' && auto.uploadType !== selectedUploadType) {
        return false;
      }
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        const nameMatch = auto.name?.toLowerCase().includes(query);
        const personaMatch =
          auto.persona?.name?.toLowerCase().includes(query) ||
          String(auto.personaId).includes(query);
        const platformMatch = auto.platform.toLowerCase().includes(query);
        const targetMatch = auto.target.toLowerCase().includes(query);
        const typeMatch = auto.uploadType.toLowerCase().includes(query);
        const idMatch = String(auto.id).includes(query);

        if (!nameMatch && !personaMatch && !platformMatch && !targetMatch && !typeMatch && !idMatch) {
          return false;
        }
      }
      return true;
    });
  }, [automationsList, selectedPlatform, selectedTarget, selectedUploadType, debouncedSearch]);

  const handleTabSwitch = (tab: 'rules' | 'runs') => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      prev.set('tab', tab);
      return prev;
    });
  };

  const handleCreate = () => {
    setEditingAutomation(null);
    setCloneAutomation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setCloneAutomation(null);
    setIsModalOpen(true);
  };

  const handleClone = (automation: Automation) => {
    setEditingAutomation(null);
    setCloneAutomation(automation);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      await deleteAutomation(id);
    }
  };

  return (
    <div className='p-6 space-y-6 w-full'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2.5'>
            <div className='w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0'>
              <Zap className='w-4 h-4' />
            </div>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900 tracking-tight'>
              Publishing Automations
            </h1>
            <span className='font-mono text-xs font-semibold text-primary-800 bg-primary-100 px-2.5 py-0.5 rounded-md'>
              {activeTab === 'rules'
                ? `${pagination?.totalCount ?? filteredRulesData.length} rules`
                : `${runsPagination?.totalCount ?? runsList.length} runs`}
            </span>
          </div>
          <p className='text-xs text-gray-500 max-w-2xl'>
            Configure and monitor autonomous scheduled publishing pipelines across YouTube Channels and Instagram Reels with randomized natural time windows.
          </p>
        </div>

        <Button
          size='sm'
          onClick={handleCreate}
          className='bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto'
          data-testid='create-automation-btn'
        >
          <Plus className='w-4 h-4' />
          Create Automation
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className='flex items-center gap-2 border-b border-gray-200 pb-0'>
        <button
          onClick={() => handleTabSwitch('rules')}
          data-testid='tab-automation-rules'
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'rules'
              ? 'border-primary-600 text-primary-700 bg-primary-50/50 rounded-t-lg'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Sliders className='w-4 h-4' />
          Automation Rules
        </button>

        <button
          onClick={() => handleTabSwitch('runs')}
          data-testid='tab-execution-runs'
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'runs'
              ? 'border-primary-600 text-primary-700 bg-primary-50/50 rounded-t-lg'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <Activity className='w-4 h-4' />
          Execution Runs & History
        </button>
      </div>

      {/* Main Content Card: Rules Tab */}
      {activeTab === 'rules' && (
        <div className='bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4'>
          {/* Rules Filter Controls Row */}
          <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3'>
            {/* Multi-Select Filter Bar */}
            <div className='flex items-center gap-2 flex-wrap text-xs'>
              {/* Persona Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Persona:</span>
                <select
                  value={selectedPersonaId}
                  onChange={(e) =>
                    setSelectedPersonaId(
                      e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                    )
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='persona-filter-select'
                >
                  <option value='ALL'>All Personas</option>
                  {personas.map((p: Persona) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Platform:</span>
                <select
                  value={selectedPlatform}
                  onChange={(e) =>
                    setSelectedPlatform(e.target.value as AutomationPlatform | 'ALL')
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='platform-filter-select'
                >
                  <option value='ALL'>All Platforms</option>
                  <option value='YOUTUBE'>YouTube</option>
                  <option value='INSTAGRAM'>Instagram</option>
                </select>
              </div>

              {/* Target Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Target:</span>
                <select
                  value={selectedTarget}
                  onChange={(e) =>
                    setSelectedTarget(e.target.value as AutomationTarget | 'ALL')
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='target-filter-select'
                >
                  <option value='ALL'>All Targets</option>
                  <option value='PROJECT'>Master Video</option>
                  <option value='SHORTS_CLIP'>Shorts Clip</option>
                </select>
              </div>

              {/* Upload Type Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Mode:</span>
                <select
                  value={selectedUploadType}
                  onChange={(e) =>
                    setSelectedUploadType(e.target.value as AutomationUploadType | 'ALL')
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='mode-filter-select'
                >
                  <option value='ALL'>All Modes</option>
                  <option value='DRAFT'>Draft</option>
                  <option value='ACTUAL_POST'>Publish (Actual Post)</option>
                </select>
              </div>
            </div>

            {/* Search Box */}
            <DataTableFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder='Search automations...'
            />
          </div>

          {/* Data Table */}
          <AutomationsDataTable
            data={filteredRulesData}
            isLoading={isLoadingRules}
            onEdit={handleEdit}
            onClone={handleClone}
            onDelete={handleDelete}
            onViewDetails={(auto) => setDetailsAutomation(auto)}
            hidePersonaColumn={false}
          />

          {/* Pagination */}
          {pagination && (
            <DataTablePagination
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      )}

      {/* Main Content Card: Runs Tab */}
      {activeTab === 'runs' && (
        <div className='bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4' data-testid='execution-runs-section'>
          {/* Runs Filter Controls Row */}
          <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3'>
            {/* Multi-Select Filter Bar */}
            <div className='flex items-center gap-2 flex-wrap text-xs'>
              {/* Persona Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Persona:</span>
                <select
                  value={selectedRunPersonaId}
                  onChange={(e) =>
                    setSelectedRunPersonaId(
                      e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                    )
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='run-persona-filter-select'
                >
                  <option value='ALL'>All Personas</option>
                  {personas.map((p: Persona) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Platform:</span>
                <select
                  value={selectedRunPlatform}
                  onChange={(e) =>
                    setSelectedRunPlatform(e.target.value as AutomationPlatform | 'ALL')
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='run-platform-filter-select'
                >
                  <option value='ALL'>All Platforms</option>
                  <option value='YOUTUBE'>YouTube</option>
                  <option value='INSTAGRAM'>Instagram</option>
                </select>
              </div>

              {/* Target Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Target:</span>
                <select
                  value={selectedRunTarget}
                  onChange={(e) =>
                    setSelectedRunTarget(e.target.value as AutomationTarget | 'ALL')
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='run-target-filter-select'
                >
                  <option value='ALL'>All Targets</option>
                  <option value='PROJECT'>Master Video</option>
                  <option value='SHORTS_CLIP'>Shorts Clip</option>
                </select>
              </div>

              {/* Upload Type Dropdown */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Mode:</span>
                <select
                  value={selectedRunUploadType}
                  onChange={(e) =>
                    setSelectedRunUploadType(e.target.value as AutomationUploadType | 'ALL')
                  }
                  className='text-xs rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='run-mode-filter-select'
                >
                  <option value='ALL'>All Modes</option>
                  <option value='DRAFT'>Draft</option>
                  <option value='ACTUAL_POST'>Publish (Actual Post)</option>
                </select>
              </div>

              {/* Status Dropdown (Default: SUCCESS) */}
              <div className='flex items-center gap-1.5'>
                <span className='text-gray-500 font-medium'>Status:</span>
                <select
                  value={selectedRunStatus}
                  onChange={(e) =>
                    setSelectedRunStatus(e.target.value as AutomationRunStatus | 'ALL')
                  }
                  className='text-xs font-medium rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 focus:border-primary-500 focus:outline-none'
                  data-testid='run-status-filter-select'
                >
                  <option value='ALL'>All Statuses</option>
                  <option value='SUCCESS'>Success</option>
                  <option value='FAILED'>Failed</option>
                  <option value='SKIPPED'>All Skipped</option>
                  <option value='SKIPPED_COOLDOWN'>Skipped (Cooldown)</option>
                  <option value='SKIPPED_NO_ASSETS'>Skipped (No Assets)</option>
                  <option value='SKIPPED_QUOTA'>Skipped (Quota Exceeded)</option>
                  <option value='IN_PROGRESS'>Pending / In Progress</option>
                </select>
              </div>
            </div>

            {/* Search Box */}
            <DataTableFilterBar
              searchValue={runsSearch}
              onSearchChange={setRunsSearch}
              searchPlaceholder='Search execution runs...'
            />
          </div>

          {/* Runs Data Table */}
          <AutomationRunsDataTable
            data={runsList}
            isLoading={isLoadingRuns}
            hidePersonaColumn={false}
          />

          {/* Pagination */}
          {runsPagination && (
            <DataTablePagination
              pagination={runsPagination}
              onPageChange={setRunsPage}
              onLimitChange={setRunsLimit}
            />
          )}
        </div>
      )}

      {/* Create / Edit / Clone Modal */}
      <AutomationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAutomation(null);
          setCloneAutomation(null);
        }}
        automation={editingAutomation}
        cloneFrom={cloneAutomation}
      />

      {/* Details & Telemetry Modal */}
      <AutomationDetailsModal
        isOpen={!!detailsAutomation}
        onClose={() => setDetailsAutomation(null)}
        automation={detailsAutomation}
        onEdit={(auto) => {
          setDetailsAutomation(null);
          handleEdit(auto);
        }}
        onClone={(auto) => {
          setDetailsAutomation(null);
          handleClone(auto);
        }}
      />
    </div>
  );
};

export default AutomationsPage;
