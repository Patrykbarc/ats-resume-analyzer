import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { CreditCard } from 'lucide-react'
import { CurrentPlanDetails } from './components/current-plan-details'
import { CanceledSubscriptionStatus } from './components/canceled-subscription-status'
import { ExpiredSubscriptionStatus } from './components/expired-subscription-status'
import { UserBillingInformation } from './types/types'

export function SubscriptionDetailsCard({
  id,
  nextBillingDate,
  subscriptionStatus,
  cancelAtPeriodEnd
}: UserBillingInformation) {
  const isCanceled = subscriptionStatus === 'canceled' && !cancelAtPeriodEnd
  const isPendingCancel = subscriptionStatus === 'active' && cancelAtPeriodEnd

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />
          <CardTitle>Current Subscription</CardTitle>
        </div>
        <CardDescription>Manage your subscription plan</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {subscriptionStatus == null && (
          <CardContainer className="bg-muted/50">
            <p className="text-sm">No active subscription found.</p>
            <Link
              to="/pricing"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'mt-4'
              )}
            >
              View pricing
            </Link>
          </CardContainer>
        )}

        {subscriptionStatus === 'active' && !cancelAtPeriodEnd && (
          <CurrentPlanDetails id={id} nextBillingDate={nextBillingDate} />
        )}

        {isPendingCancel && (
          <CanceledSubscriptionStatus nextBillingDate={nextBillingDate} />
        )}

        {isCanceled && <ExpiredSubscriptionStatus />}
      </CardContent>
    </Card>
  )
}
