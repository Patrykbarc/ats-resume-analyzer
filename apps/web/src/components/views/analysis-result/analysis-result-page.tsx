import { useGetAnalyseById } from '@/hooks/useGetAnalyseById'
import { Link, useParams } from '@tanstack/react-router'
import { StatusCodes } from 'http-status-codes'
import { ArrowLeftIcon } from 'lucide-react'
import { NotFoundPage } from '../not-found/not-found-page'
import { AnalysisResults } from './components/analysis-result'
import { AnalysisSkeletonWithNavigation } from './components/skeletons/analysis-results-skeleton'

export function AnalysisResultPage() {
  const { id } = useParams({ from: '/(app)/analyse/$id' })
  const { data: analysis, isLoading, isError, error } = useGetAnalyseById(id)

  if (isLoading) {
    return <AnalysisSkeletonWithNavigation />
  }

  if (isError) {
    if (error.status === StatusCodes.NOT_FOUND) {
      return <NotFoundPage />
    }

    return <div className="text-rose-500">{error.message}</div>
  }

  return (
    <div>
      <div className="pb-4">
        <Link to="/" className="flex gap-2 items-center">
          <ArrowLeftIcon size={16} /> Home
        </Link>
      </div>
      <AnalysisResults analysis={analysis.data} />
    </div>
  )
}
