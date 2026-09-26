import { CallTemplateDataTable } from '@/components/dashboard/callTemplate';
import { Button } from '@/components/ui/button';
import { useGetAllCallTemplateQuery } from '@/queries/callTemplateQueries';
import { useAppSelector } from '@/store/store';
import { CallTemplateRowType } from '@/types/callTemplate';
import { getCreatedDate } from '@/utils/utils';
import { ColumnDef } from '@tanstack/react-table';
import { PenIcon, PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const columns: ColumnDef<CallTemplateRowType>[] = [
  {
    accessorKey: 'callTemplateName',
    header: 'Name',
    cell: ({ row }) => (
      <div className='w-36 md:w-20 lg:w-full font-medium'>
        {row.getValue('callTemplateName')}
      </div>
    ),
  },
  {
    accessorKey: 'promptObjectiveText',
    header: 'Objective',
    cell: ({ row }) => (
      <div className='w-64 md:w-44 lg:w-full'>
        {row.getValue('promptObjectiveText')}
      </div>
    ),
  },
  {
    accessorKey: 'nameOfAI',
    header: 'Name Of AI',
    cell: ({ row }) => (
      <div className='w-28 md:w-full'>{row.getValue('nameOfAI')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const dateStr = row.getValue('createdAt') as string;

      return (
        <div className='flex gap-4 justify-between items-center w-24 lg:w-full'>
          <div className='font-medium'>{getCreatedDate(dateStr)}</div>
          <Link
            to={`/dashboard/call-template-form?callTemplateId=${row.original._id}`}
          >
            <PenIcon className='h-4 w-4 text-gray-500' />
          </Link>
        </div>
      );
    },
  },
];

const CallTemplatePage = () => {
  const { userInfo, token } = useAppSelector((store) => store.auth);
  const { data, isLoading, isError } = useGetAllCallTemplateQuery({
    token,
    teamId: userInfo?.teamIds[0],
  });

  if (isError) {
    return <p>Something went wrong, please try again..</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className='flex flex-col gap-8 px-4 md:px-8 pb-12'>
      <header className='pt-8 flex flex-col items-start md:flex-row md:justify-between md:items-center gap-4'>
        <h2 className='text-gray-900 text-2xl md:text-3xl font-medium'>
          Call Template
        </h2>

        <Button asChild size='md' className='p-0 text-white'>
          <Link
            to='/dashboard/call-template-form'
            className='flex py-[10px] pl-3 pr-4 text-sm gap-2'
          >
            <PlusIcon className='w-5 h-5' />
            <span className='font-medium'>Add</span>
          </Link>
        </Button>
      </header>

      <CallTemplateDataTable columns={columns} data={data} />
    </main>
  );
};

export default CallTemplatePage;

// <main className='flex flex-col gap-8'>
//   <section className='flex flex-col gap-6'>
//     <div className='border-b border-b-gray-200 pb-5'>
//       <h3>Active now</h3>

//       {/* dropdown and its icon as sibling here. */}
//     </div>

//     {/* graph 1 */}
//     <div className='h-60 border-2 border-error-500'></div>
//   </section>

//   <section className='flex flex-col gap-6'>
//     <div className='border-b border-b-gray-200 pb-5'>
//       <h3>Total Customers</h3>

//       {/* dropdown and its icon as sibling here. */}
//     </div>

//     {/* graph 2 */}
//     <div className='h-60 border-2 border-error-500'></div>
//   </section>
//   {/* graph 2 */}
// </main>
