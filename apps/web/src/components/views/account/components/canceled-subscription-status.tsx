import { CardContainer } from '@/components/ui/card'
import { useLoaderData } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NextBillingDate } from '../types/types'
import { RestoreSubscription } from './restore-subscription'

export function CanceledSubscriptionStatus({
  nextBillingDate
}: {
  nextBillingDate: NextBillingDate
}) {
  const { t } = useTranslation('account')
  const data = useLoaderData({ from: '/(app)/account/' })

  if (!data) {
    return null
  }

  return (
    <CardContainer className="flex items-start gap-3 bg-destructive/10 border-destructive/20">
      <AlertTriangle className="size-5 text-destructive mt-0.5 hrink-0" />
      <div>
        <p className="text-sm font-medium text-destructive">
          {t('subscription.canceled.title')}
        </p>
        <p className="text-sm whitespace-pre-line text-muted-foreground mt-1">
          <span>
            {t('subscription.canceled.expiry', { date: nextBillingDate })}
          </span>{' '}
          <span>{t('subscription.canceled.canRestore')}</span>
        </p>

        <RestoreSubscription id={data.id} className="mt-4" />
      </div>
    </CardContainer>
  )
}
