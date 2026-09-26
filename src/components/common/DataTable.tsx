import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No results found.',
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm'>
      <Table className='max-w-full overflow-auto'>
        <TableHeader className='bg-gray-50 border-b border-gray-200'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className='hover:bg-transparent'>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className='text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4'
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-32 text-center text-gray-500 text-sm'
              >
                <div className='flex items-center justify-center gap-2'>
                  <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent' />
                  <span>Loading data...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className='border-b border-gray-100 hover:bg-gray-50/80 transition-colors'
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='py-3.5 px-4 text-sm'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-32 text-center text-gray-500 text-sm font-medium'
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
