import { Analyzer, AnalyzerSkeleton } from '@/components/ui/analyzer'
import { LATEST_HISTORY_LIMIT } from '@/constants/history-pagination-limits'
import { useGetAnalysisHistory } from '@/hooks/useGetAnalysisHistory/useGetAnalysisHistory'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { AnalysisHistorySkeleton } from '../latests-analysis-history/components/skeletons/latests-analysis-history-skeleton'
import { Faq } from '../seo/faq'
import { Features } from '../seo/features'

const LatestsAnalysisHistory = lazy(() =>
  import(
    '@/components/views/latests-analysis-history/latests-analysis-history'
  ).then((mod) => ({ default: mod.LatestsAnalysisHistory }))
)



export function HomePage() {
  const { t } = useTranslation('seo')
  const { user, isLoading } = useSessionStore()
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
        {isLoading ? <AnalyzerSkeleton /> : <Analyzer />}

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
