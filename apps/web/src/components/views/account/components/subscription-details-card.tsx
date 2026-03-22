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
import { useTranslation } from 'react-i18next'
import { UserBillingInformation } from '../types/types'
import { CanceledSubscriptionStatus } from './canceled-subscription-status'
import { CurrentPlanDetails } from './current-plan-details'
import { ExpiredSubscriptionStatus } from './expired-subscription-status'

export function SubscriptionDetailsCard({
  id,
  nextBillingDate,
  subscriptionStatus,
  cancelAtPeriodEnd
}: UserBillingInformation) {
  const { t } = useTranslation('account')
  const isCanceled = subscriptionStatus === 'canceled' && !cancelAtPeriodEnd
  const isPendingCancel = subscriptionStatus === 'active' && cancelAtPeriodEnd

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />
          <CardTitle>{t('subscription.title')}</CardTitle>
        </div>
        <CardDescription>{t('subscription.description')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {subscriptionStatus == null && (
          <CardContainer className="bg-muted/50">
            <p className="text-sm">{t('subscription.noActive')}</p>
            <Link
              to="/pricing"
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'mt-4'
              )}
            >
              {t('buttons.viewPricing', { ns: 'common' })}
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
