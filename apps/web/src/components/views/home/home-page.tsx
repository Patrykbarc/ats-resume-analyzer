import { Skeleton } from '@/components/ui/skeleton'
import { LATEST_HISTORY_LIMIT } from '@/constants/history-pagination-limits'
import { useGetAnalysisHistory } from '@/hooks/useGetAnalysisHistory/useGetAnalysisHistory'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { AnalysisHistorySkeleton } from '../latests-analysis-history/components/skeletons/latests-analysis-history-skeleton'
import { useAnalyzer } from '../resume-analyzer/hooks/useAnalyzer'
import { Faq } from '../seo/faq'
import { Features } from '../seo/features'

const LatestsAnalysisHistory = lazy(() =>
  import(
    '@/components/views/latests-analysis-history/latests-analysis-history'
  ).then((mod) => ({ default: mod.LatestsAnalysisHistory }))
)

const RequestLimitError = lazy(() =>
  import('@/components/ui/request-limit-error').then((mod) => ({
    default: mod.RequestLimitError
  }))
)

const ResumeAnalyzer = lazy(() =>
  import('@/components/views/resume-analyzer/resume-analyzer').then((mod) => ({
    default: mod.ResumeAnalyzer
  }))
)

export function HomePage() {
  const analyzer = useAnalyzer()
  const { requestsLeft } = useRateLimit()
  const { t } = useTranslation('seo')
  const { user } = useSessionStore()
  const { data: history } = useGetAnalysisHistory({
    id: user?.id ?? '',
    limit: LATEST_HISTORY_LIMIT,
    keyType: 'latestHistory'
  })

  return (
    <div className="space-y-12 md:space-y-24">
      <header className="mb-12 text-center">
        <h1 className="mb-4 mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
          {t('home.title')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl text-pretty leading-relaxed">
          {t('home.subtitle')}
        </p>
      </header>

      <section className="space-y-6">
        <Suspense
          fallback={<Skeleton className="mx-auto h-92.5 w-full rounded-md" />}
        >
          {requestsLeft === 1 ? (
            <RequestLimitError />
          ) : (
            <ResumeAnalyzer {...analyzer} />
          )}
        </Suspense>

        {history && history?.data.logs.length > 0 && (
          <Suspense fallback={<AnalysisHistorySkeleton />}>
            <LatestsAnalysisHistory history={history?.data ?? []} />
          </Suspense>
        )}
      </section>

      <Features />
      <Faq />
    </div>
  )
}
