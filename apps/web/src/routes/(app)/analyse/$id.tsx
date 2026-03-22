import { AnalysisResultPage } from '@/components/views/analysis-result/analysis-result-page'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/analyse/$id')({
  component: AnalysisResultPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Analysis')
      }
    ]
  })
})
