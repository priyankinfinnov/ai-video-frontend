// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ListFilterIcon, SearchIcon } from 'lucide-react';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DataTableType } from '@/types/callTemplate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CallTemplateDataTable = <TData, TValue>({
  columns,
  data,
}: DataTableType<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section>
      {/* search and filters container */}
      {/* paste the below code here */}

      {/* return from here */}
      {/* table  */}
      <div className='rounded-lg border mt-6 md:mt-[1.625rem]'>
        <Table className='max-w-full overflow-auto shadow-sm'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className='text-sm' key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default CallTemplateDataTable;

// <div className='flex flex-col md:flex-row-reverse gap-3 md:justify-between md:items-center'>
//   {/* Search Input */}
//   <div className='relative w-full md:max-w-xs'>
// <Input
//   name='search'
//   type='Search'
//   placeholder='Search'
//   className='w-full pl-[2.625rem] placeholder:text-gray-500 placeholder:text-base'
// />
//     <SearchIcon className='absolute top-[50%] translate-y-[-50%] left-[.875rem] w-5 h-5 text-gray-500' />
//   </div>

//   <div className='flex flex-col md:flex-row gap-3 text-gray-700 font-medium'>
//     <Button
//       className='flex gap-2 justify-center items-center'
//       size='md'
//       variant='secondary-gray'
//     >
//       <ListFilterIcon className='w-5 h-5' />

//       <span className='text-sm'>Edit filters</span>
//     </Button>
//   </div>
// </div>;
