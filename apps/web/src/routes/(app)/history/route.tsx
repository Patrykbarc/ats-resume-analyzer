import { AnalysisHistory } from '@/components/views/analysis-history/analysis-history'
import { withSessionGuard } from '@/guards/withSessionGuard'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/history')({
  beforeLoad: async ({ context: { queryClient } }) =>
    withSessionGuard({ queryClient }),
  component: AnalysisHistory,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('History')
      }
    ]
  })
})
