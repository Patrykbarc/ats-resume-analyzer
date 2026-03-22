import { AccountPage } from '@/components/views/account/account-page'
import { AccountPageSkeleton } from '@/components/views/account/components/skeletons/account-page-skeleton'
import { QUERY_KEYS } from '@/constants/query-keys'
import { sessionGuard } from '@/guards/sessionGuard'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { getUserAccountInformationsService } from '@/services/authService'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/account/')({
  beforeLoad: async ({ context: { queryClient } }) =>
    sessionGuard({ queryClient }),
  loader: async ({ context: { queryClient } }) => {
    const data = await queryClient.ensureQueryData({
      queryKey: QUERY_KEYS.session.account,
      queryFn: getUserAccountInformationsService
    })
    if (!data) {
      throw redirect({ to: '/login' })
    }
    return data
  },
  component: AccountPage,
  pendingComponent: AccountPageSkeleton,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Account')
      }
    ]
  })
})
