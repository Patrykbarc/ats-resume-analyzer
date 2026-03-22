import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

export function AnalysisHistorySkeleton() {
  const { t } = useTranslation('analysis')

  return (
    <Card className="border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t('history.title')}
      </h3>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4"
          >
            <div className="flex flex-1 items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>
            <div className="ml-4 flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-10" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
