import { Pagination } from '@/components/ui/pagination/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { HISTORY_PAGE_LIMIT } from '@/constants/history-pagination-limits'
import { HistoryLogs } from '@/hooks/useGetAnalysisHistory/types/types'
import { useGetAnalysisHistory } from '@/hooks/useGetAnalysisHistory/useGetAnalysisHistory'
import { formatHistoryDate } from '@/lib/formatHistoryDate'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { Link } from '@tanstack/react-router'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { File } from 'lucide-react'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useMemo } from 'react'

type Column = ColumnDef<HistoryLogs>[]

export function AnalysisHistory() {
  const { user } = useSessionStore()
  const [currentPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data: history, isLoading } = useGetAnalysisHistory({
    id: user?.id ?? '',
    limit: HISTORY_PAGE_LIMIT,
    page: currentPage,
    keyType: 'historyPage'
  })

  const historyLogs: HistoryLogs[] = history?.data.logs ?? []
  const pagination = history?.data.pagination

  const columns: Column = useMemo(
    () => [
      {
        header: 'File Name',
        accessorKey: 'fileName',
        cell: ({ row: { original } }) => (
          <div className="flex items-center gap-2">
            <File className="size-4 text-accent shrink-0" />
            <Link
              to="/analyse/$id"
              params={{ id: original.analyseId }}
              className="hover:underline underline-offset-2"
            >
              {original.fileName}
            </Link>
          </div>
        )
      },
      {
        header: 'Analyzed At',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => {
          const createdAt = getValue<HistoryLogs['createdAt']>()

          return formatHistoryDate(createdAt)
        }
      }
    ],
    []
  )

  const table = useReactTable({
    data: historyLogs,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const totalPages = pagination?.totalPages ?? 1
  const totalCount = pagination?.totalCount ?? 0

  const rows = table.getRowModel().rows
  const headers = table.getHeaderGroups()

  return (
    <div className="space-y-4 bg-white border p-6 rounded-xl">
      <div className="space-y-2">
        <h1 className="leading-none font-semibold">Analysis Records</h1>
        <p className="text-muted-foreground text-sm">
          {totalCount} records found
        </p>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table className="table-fixed w-full">
          <TableHeader>
            {headers.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="max-w-[250px]" key={header.id}>
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

          {isLoading ? (
            <TableBodySkeleton columns={columns} />
          ) : (
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="max-w-[250px]">
                        <div className="truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    No analysis history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {totalPages > 1 && <Pagination totalPages={totalPages} />}
    </div>
  )
}

function TableBodySkeleton({ columns }: { columns: Column }) {
  return (
    <TableBody>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((_, cellIndex) => (
            <TableCell key={`skeleton-cell-${cellIndex}`}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}
