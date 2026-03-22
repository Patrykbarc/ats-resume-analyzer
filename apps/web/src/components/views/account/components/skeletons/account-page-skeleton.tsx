import { AccountInformationCardSkeleton } from './account-information-card-skeleton'
import { SubscriptionDetailsCardSkeleton } from './subscription-details-card-skeleton'

export function AccountPageSkeleton() {
  return (
    <div className="space-y-6">
      <AccountInformationCardSkeleton />
      <SubscriptionDetailsCardSkeleton />
    </div>
  )
}
