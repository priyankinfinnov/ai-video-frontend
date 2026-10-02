import { useState, useMemo } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Automation, AutomationPlatform, AutomationTarget, AutomationUploadType } from '@/types/automation';
import { Persona } from '@/types/persona';
import { useGetAutomationsQuery } from '@/queries/automationQueries';
import { useDeleteAutomationMutation } from '@/queries/automationActions';
import { useGetPersonasQuery } from '@/queries/personaQueries';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import {
  AutomationsDataTable,
  AutomationModal,
  AutomationDetailsModal,
} from '@/components/dashboard/automations';
import useDataTableFilters from '@/hooks/useDataTableFilters';
import { DataTableFilterBar, DataTablePagination } from '@/components/common';

export const AutomationsPage = () => {
  const token = useAppSelector((store) => store.auth.token);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [detailsAutomation, setDetailsAutomation] = useState<Automation | null>(null);

  // Filters
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

  // Fetch personas for filter dropdown
  const { data: personasResponse } = useGetPersonasQuery({
    token,
    page: 1,
    limit: 100,
  });
  const personas = personasResponse?.data || [];

  // Automations query
  const {
    data: automationsResponse,
    isLoading,
  } = useGetAutomationsQuery({
    token,
    personaId: selectedPersonaId === 'ALL' ? undefined : selectedPersonaId,
    page,
    limit,
  });

  const { mutateAsync: deleteAutomation } = useDeleteAutomationMutation(token);

  const automationsList = useMemo(
    () => automationsResponse?.data || [],
    [automationsResponse?.data]
  );
  const pagination = automationsResponse?.pagination;

  // Filter client-side by search and dropdowns
  const filteredData = useMemo(() => {
    return automationsList.filter((auto) => {
      // Platform filter
      if (selectedPlatform !== 'ALL' && auto.platform !== selectedPlatform) {
        return false;
      }
      // Target filter
      if (selectedTarget !== 'ALL' && auto.target !== selectedTarget) {
        return false;
      }
      // Upload Type filter
      if (selectedUploadType !== 'ALL' && auto.uploadType !== selectedUploadType) {
        return false;
      }
      // Text search
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

  const handleCreate = () => {
    setEditingAutomation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
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
              {pagination?.totalCount ?? filteredData.length} rules
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

      {/* Main Content Card */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-4'>
        {/* Filter Controls Row */}
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
          data={filteredData}
          isLoading={isLoading}
          onEdit={handleEdit}
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

      {/* Create / Edit Modal */}
      <AutomationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAutomation(null);
        }}
        automation={editingAutomation}
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
      />
    </div>
  );
};

export default AutomationsPage;
