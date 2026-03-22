import { QUERY_KEYS } from '@/constants/query-keys'
import { getUserAccountInformationsService } from '@/services/authService'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AccountInformationCard } from './components/account-information-card'
import { SubscriptionDetailsCard } from './components/subscription-details-card'

export function AccountPage() {
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
