import { Skeleton } from '@/components/ui/skeleton'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { lazy, Suspense } from 'react'
import { useAnalyzer } from '../views/resume-analyzer/hooks/useAnalyzer'

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

function Analyzer() {
  const analyzerProps = useAnalyzer()
  const { requestsLeft, isCooldownActive } = useRateLimit()
  const { isPremium } = useSessionStore()

  const shouldShowRequestError =
    (isCooldownActive || requestsLeft === 0) && !analyzerProps.isPending

  return (
    <Suspense fallback={<AnalyzerSkeleton />}>
      {!isPremium && shouldShowRequestError ? (
        <RequestLimitError />
      ) : (
        <ResumeAnalyzer {...analyzerProps} />
      )}
    </Suspense>
  )
}

function AnalyzerSkeleton() {
  return <Skeleton className="mx-auto h-92.5 w-full rounded-md" />
}

export { Analyzer, AnalyzerSkeleton }
