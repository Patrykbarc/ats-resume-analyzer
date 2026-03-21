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
import { useRestoreSubscription } from '@/hooks/checkout/useRestoreSubscription'
import { cn } from '@/lib/utils'
import { User } from '@monorepo/database'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export function RestoreSubscription({
  id,
  className
}: {
  id: User['id']
  className?: string
}) {
  const { t } = useTranslation('account')
  const queryClient = useQueryClient()

  const { isPending, mutate } = useRestoreSubscription({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.account
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.currentUser
      })
    },
    onError: () => {
      toast.error(t('subscription.restore.errorToast'))
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger className={className} asChild>
        <Button
          variant="default"
          size="sm"
          className="w-fit md:ml-auto"
          disabled={isPending}
        >
          {t('subscription.restore.button')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-destructive" />
            <AlertDialogTitle>
              {t('subscription.restore.title')}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <span>{t('subscription.restore.confirm')}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={cn(buttonVariants({ variant: 'secondary' }))}
          >
            {t('subscription.restore.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'default' }))}
            onClick={() => mutate({ id })}
          >
            {t('subscription.restore.yes')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
