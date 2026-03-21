import { CardContainer } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { UserBillingInformation } from '../types/types'
import { CancelSubscription } from './cancel-subscription'

export function CurrentPlanDetails({
  id,
  nextBillingDate
}: UserBillingInformation) {
  const { t } = useTranslation('account')

  return (
    <CardContainer className="bg-muted/50">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('subscription.plan')}
        </h3>
      </div>

      <div className="space-y-6 grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-medium">
            $14.99{' '}
            <span className="text-xs text-muted-foreground">
              {t('subscription.monthly')}
            </span>
          </p>
        </div>

        <CancelSubscription
          className="md:block hidden"
          id={id}
          nextBillingDate={nextBillingDate}
        />

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t('subscription.nextBillingDate')}
          </p>
          <p className="text-base font-medium text-foreground">
            {nextBillingDate}
          </p>
        </div>

        <CancelSubscription
          className="block md:hidden"
          id={id}
          nextBillingDate={nextBillingDate}
        />
      </div>
    </CardContainer>
  )
}
