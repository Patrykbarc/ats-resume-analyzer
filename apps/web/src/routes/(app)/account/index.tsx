import { AccountInformationCard } from '@/components/views/account/account-information-card'
import { AccountInformationCardSkeleton } from '@/components/views/account/components/skeletons/account-information-card-skeleton'
import { SubscriptionDetailsCardSkeleton } from '@/components/views/account/components/skeletons/subscription-details-card-skeleton'
import { SubscriptionDetailsCard } from '@/components/views/account/subscription-details-card'
import { QUERY_KEYS } from '@/constants/query-keys'
import { sessionGuard } from '@/guards/sessionGuard'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { getUserAccountInformationsService } from '@/services/authService'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { format } from 'date-fns'

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
  component: RouteComponent,
  pendingComponent: LoadingComponent,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Account')
      }
    ]
  })
})

function RouteComponent() {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.session.account,
    queryFn: getUserAccountInformationsService
  })

  if (!data) {
    return null
  }

  const nextBillingDate =
    data.subscriptionCurrentPeriodEnd &&
    format(data.subscriptionCurrentPeriodEnd, 'MMMM dd, yyyy')

  return (
    <div className="space-y-6">
      <AccountInformationCard createdAt={data.createdAt} email={data.email} />
      <SubscriptionDetailsCard
        id={data.id}
        nextBillingDate={nextBillingDate}
        subscriptionStatus={data.subscriptionStatus}
        cancelAtPeriodEnd={data.cancelAtPeriodEnd}
      />
    </div>
  )
}

function LoadingComponent() {
  return (
    <div className="space-y-6">
      <AccountInformationCardSkeleton />
      <SubscriptionDetailsCardSkeleton />
    </div>
  )
}
