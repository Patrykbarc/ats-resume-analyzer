import { buttonVariants } from '@/components/ui/button'
import { CardContainer } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ExpiredSubscriptionStatus() {
  const { t } = useTranslation('account')

  return (
    <CardContainer className="flex items-start gap-3 bg-muted/50 border-muted-foreground/20">
      <XCircle className="size-5 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {t('subscription.expired.title')}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('subscription.expired.description')}
        </p>

        <Link
          to="/pricing"
          className={cn(
            buttonVariants({ variant: 'default', size: 'sm' }),
            'mt-4'
          )}
        >
          {t('buttons.viewPricing', { ns: 'common' })}
        </Link>
      </div>
    </CardContainer>
  )
}
