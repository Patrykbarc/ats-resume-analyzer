import { AnalysisHistoryPage } from '@/components/views/analysis-history/analysis-history-page'
import { sessionGuard } from '@/guards/sessionGuard'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/history')({
  beforeLoad: async ({ context: { queryClient } }) =>
    sessionGuard({ queryClient }),
  component: AnalysisHistoryPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('History')
      }
    ]
  })
})
