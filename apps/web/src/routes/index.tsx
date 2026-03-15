import { AnalysisHistorySkeleton } from '@/components/views/latests-analysis-history/latests-analysis-history-skeleton'
import { ResumeAnalyzer } from '@/components/views/resume-analyzer/resume-analyzer'
import { Faq } from '@/components/views/seo/faq'
import { Features } from '@/components/views/seo/features'
import { LATEST_HISTORY_LIMIT } from '@/constants/history-pagination-limits'
import { useGetAnalysisHistory } from '@/hooks/useGetAnalysisHistory/useGetAnalysisHistory'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const LatestsAnalysisHistory = lazy(() =>
  import(
    '@/components/views/latests-analysis-history/latests-analysis-history'
  ).then((mod) => ({ default: mod.LatestsAnalysisHistory }))
)

export const Route = createFileRoute('/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: buildPageTitle()
      }
    ]
  })
})

function RouteComponent() {
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
          AI-Powered Resume Analyzer
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl text-pretty leading-relaxed">
          Get instant AI-powered insights to improve your resume and land more
          interviews
        </p>
      </header>

      <section className="space-y-6">
        <ResumeAnalyzer />
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
