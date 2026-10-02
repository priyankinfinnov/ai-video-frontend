import { useState, useMemo } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Persona } from '@/types/persona';
import { Automation } from '@/types/automation';
import { useGetAutomationsQuery } from '@/queries/automationQueries';
import { useDeleteAutomationMutation } from '@/queries/automationActions';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import {
  AutomationsDataTable,
  AutomationModal,
  AutomationDetailsModal,
} from '@/components/dashboard/automations';
import useDataTableFilters from '@/hooks/useDataTableFilters';
import { DataTableFilterBar, DataTablePagination } from '@/components/common';

interface PersonaAutomationsTabProps {
  persona: Persona;
}

export const PersonaAutomationsTab = ({ persona }: PersonaAutomationsTabProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [detailsAutomation, setDetailsAutomation] = useState<Automation | null>(null);

  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 50 });

  const { data: response, isLoading } = useGetAutomationsQuery({
    token,
    personaId: persona.id,
    page,
    limit,
  });

  const { mutateAsync: deleteAutomation } = useDeleteAutomationMutation(token);

  const automationsList = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response?.pagination;

  // Filter client-side if search text provided
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return automationsList;
    const lower = debouncedSearch.toLowerCase();
    return automationsList.filter(
      (a) =>
        (a.name && a.name.toLowerCase().includes(lower)) ||
        a.platform.toLowerCase().includes(lower) ||
        a.target.toLowerCase().includes(lower) ||
        a.uploadType.toLowerCase().includes(lower) ||
        a.frequency.toLowerCase().includes(lower) ||
        String(a.id).includes(lower)
    );
  }, [automationsList, debouncedSearch]);

  const handleOpenCreate = () => {
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
    <div className='space-y-6 max-w-5xl' data-testid='persona-automations-tab'>
      {/* Tab Header Banner */}
      <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h2 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <Zap className='w-4 h-4 text-primary-600' />
            Publishing Automations for {persona.name}
          </h2>
          <p className='text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed'>
            Set up scheduled rules to automatically export and publish newly created Master Projects to YouTube Studio or vertical Shorts to Instagram Reels.
          </p>
        </div>

        <Button
          size='sm'
          onClick={handleOpenCreate}
          className='bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-1.5 shadow-xs shrink-0'
        >
          <Plus className='w-4 h-4' />
          Create Automation
        </Button>
      </div>

      {/* Filter and Table Section */}
      <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='text-xs font-semibold text-gray-700'>
            Configured Automation Rules ({pagination?.totalCount || filteredData.length})
          </div>

          <DataTableFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder='Filter by platform, target, or mode...'
          />
        </div>

        <AutomationsDataTable
          data={filteredData}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={(a) => setDetailsAutomation(a)}
          hidePersonaColumn={true}
        />

        {pagination && (
          <DataTablePagination
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      {/* Modals */}
      <AutomationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAutomation(null);
        }}
        automation={editingAutomation}
        fixedPersonaId={persona.id}
      />

      <AutomationDetailsModal
        isOpen={!!detailsAutomation}
        onClose={() => setDetailsAutomation(null)}
        automation={detailsAutomation}
        onEdit={(a) => {
          setDetailsAutomation(null);
          handleEdit(a);
        }}
      />
    </div>
  );
};

export default PersonaAutomationsTab;
