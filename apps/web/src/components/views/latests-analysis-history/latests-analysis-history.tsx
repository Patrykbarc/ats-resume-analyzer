import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnalysisHistoryResponse } from '@/hooks/useGetAnalysisHistory/types/types'
import { formatHistoryDate } from '@/lib/formatHistoryDate'

import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Clock, FileText } from 'lucide-react'

type AnalysisHistoryProps = {
  history: AnalysisHistoryResponse
}

export function LatestsAnalysisHistory({ history }: AnalysisHistoryProps) {
  const shouldShowViewAll = history?.pagination.hasMore ?? false

  return (
    <Card className="border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Analysis History
      </h3>
      <div className="space-y-3">
        {history.logs.map((record) => (
          <div
            key={record.analyseId}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4 transition-colors hover:bg-secondary/80"
          >
            <div className="flex flex-1 items-center gap-3">
              <FileText className="mt-1 h-5 w-5 text-accent" />
              <div className="min-w-0 flex-1">
                {record.fileName && (
                  <Link
                    to="/analyse/$id"
                    params={{ id: record.analyseId }}
                    className="truncate font-medium text-foreground"
                  >
                    {record.fileName}
                  </Link>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  {formatHistoryDate(record.createdAt)}
                </div>
              </div>
            </div>
            <div className="ml-4 flex gap-2">
              <Link
                to="/analyse/$id"
                params={{ id: record.analyseId }}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'text-xs'
                )}
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {shouldShowViewAll && (
        <Link className="w-fit" to="/history">
          View all
        </Link>
      )}
    </Card>
  )
}
