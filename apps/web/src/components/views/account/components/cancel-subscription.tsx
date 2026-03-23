import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useCancelSubscription } from '@/hooks/checkout/useCancelSubscription'
import { sentryLogger } from '@monorepo/sentry-logger'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { UserBillingInformation } from '../types/types'

export function CancelSubscription({
  id,
  nextBillingDate,
  className
}: UserBillingInformation) {
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()

  const { isPending, mutate } = useCancelSubscription({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.account
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.currentUser
      })
    },
    onError: (err) => {
      toast.error(t('subscription.cancel.errorToast'))
      sentryLogger.unexpected(err)
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger className={className} asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-fit md:ml-auto"
          disabled={isPending}
        >
          {t('subscription.cancel.button')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-destructive" />
            <AlertDialogTitle>
              {t('subscription.cancel.title')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <span>
              {t('subscription.cancel.confirm')}
              <br />
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {t('subscription.cancel.activeUntil', { date: nextBillingDate })}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('subscription.cancel.keep')}</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={() => mutate({ id })}
          >
            {t('subscription.cancel.yes')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
