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
import { useDeleteAccount } from '@/hooks/useDeleteAccount'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { sentryLogger } from '@monorepo/sentry-logger'
import { useNavigate } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export function DeleteAccount() {
  const { t } = useTranslation('account')
  const navigate = useNavigate()
  const { resetUserState } = useSessionStore()

  const { isPending, mutate } = useDeleteAccount({
    onSuccess: () => {
      localStorage.removeItem('jwtToken')
      resetUserState()
      navigate({ to: '/login' })
    },
    onError: (err) => {
      toast.error(t('deleteAccount.errorToast'))
      sentryLogger.unexpected(err)
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isPending}>
          {t('deleteAccount.button')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-destructive" />
            <AlertDialogTitle>{t('deleteAccount.title')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t('deleteAccount.confirm')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('deleteAccount.keep')}</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={() => mutate()}
            disabled={isPending}
          >
            {t('deleteAccount.yes')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
