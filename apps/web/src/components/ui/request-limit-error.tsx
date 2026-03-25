import { useRateLimit } from '@/hooks/useRateLimit'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from './button'

export function RequestLimitError() {
  const { t } = useTranslation('errors')
  const { cooldownDate } = useRateLimit()

  const formattedDate = format(cooldownDate ? cooldownDate : new Date(), 'PPp')

  return (
    <div className="w-full mx-auto max-w-md space-y-8 rounded-lg border border-border bg-card p-8 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-foreground">
          {t('rateLimit.title')}
        </h1>

        {cooldownDate && (
          <p className="text-sm text-card-foreground whitespace-pre-line max-w-80 mx-auto">
            {t('rateLimit.renewsAt', { date: formattedDate })}
          </p>
        )}

        <Link to="/pricing" className={cn(buttonVariants(), 'mt-3')}>
          {t('rateLimit.upgrade')}
        </Link>
      </div>
    </div>
  )
}
