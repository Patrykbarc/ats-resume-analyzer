import { buttonVariants } from '@/components/ui/button'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useVerifyStripeSession } from '@/hooks/checkout/useVerifyStripeSession'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorCheckoutPage } from './payment-verification-error-page'

export function SuccessCheckoutPage() {
  const { t } = useTranslation('checkout')
  const queryClient = useQueryClient()
  const { id } = useSearch({ from: '/(app)/checkout/success/' })
  const { data, isLoading, isError } = useVerifyStripeSession(id)

  useEffect(() => {
    if (data && !isError) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.currentUser
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.subscription.user
      })
    }
  }, [data, isError, queryClient])

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="size-10 text-primary animate-spin mx-auto mb-4" />
        <h1 className="text-xl">{t('success.verifying.title')}</h1>
        <p className="text-muted-foreground">
          {t('success.verifying.description')}
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorCheckoutPage
        title={t('success.error.title')}
        message={t('success.error.message')}
      />
    )
  }

  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-100 animate-in zoom-in duration-500">
        <CheckCircle2 className="size-10 text-green-800" aria-hidden="true" />
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
        {t('success.title')}
      </h1>
      <p className="text-lg text-muted-foreground text-pretty">
        {t('success.description')}
      </p>
      <Link
        to="/"
        className={cn(buttonVariants({ variant: 'link' }), 'mt-4 text-lg')}
      >
        {t('success.returnHome')}
      </Link>
    </div>
  )
}
