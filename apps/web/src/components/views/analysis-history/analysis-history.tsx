import { Button } from '@/components/ui/button'
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
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Column = ColumnDef<HistoryLogs>[]

export function AnalysisHistory() {
  const { t } = useTranslation('analysis')
  const { user } = useSessionStore()
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [accumulatedLogs, setAccumulatedLogs] = useState<HistoryLogs[]>([])

  const { data: history, isLoading } = useGetAnalysisHistory({
    id: user?.id ?? '',
    limit: HISTORY_PAGE_LIMIT,
    cursor,
    keyType: 'historyPage'
  })

  const pagination = history?.data?.pagination
  const incomingLogs = history?.data?.logs

  useEffect(() => {
    if (!incomingLogs?.length) {
      return
    }

    setAccumulatedLogs((prev) => {
      const existingIds = new Set(prev.map((l) => l.analyseId))
      const fresh = incomingLogs.filter((l) => !existingIds.has(l.analyseId))
      return fresh.length ? [...prev, ...fresh] : prev
    })
  }, [incomingLogs])

  const handleLoadMore = () => {
    if (pagination?.nextCursor) {
      setCursor(pagination.nextCursor)
    }
  }

  const columns: Column = useMemo(
    () => [
      {
        header: t('history.fileName'),
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
        header: t('history.analyzedAt'),
        accessorKey: 'createdAt',
        cell: ({ getValue }) => {
          const createdAt = getValue<HistoryLogs['createdAt']>()
          return formatHistoryDate(createdAt)
        }
      }
    ],
    [t]
  )

  const table = useReactTable({
    data: accumulatedLogs,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const rows = table.getRowModel().rows
  const headers = table.getHeaderGroups()

  const isInitialLoading = isLoading && accumulatedLogs.length === 0

  return (
    <div className="space-y-4 bg-white border p-6 rounded-xl">
      <div className="space-y-2">
        <h1 className="leading-none font-semibold">{t('history.records')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('history.recordsLoaded', { count: accumulatedLogs.length })}
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

          {isInitialLoading ? (
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
                    {t('history.noHistory')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {pagination?.hasMore && (
        <Button
          variant="outline"
          onClick={handleLoadMore}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? t('history.loading') : t('history.loadMore')}
        </Button>
      )}
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
