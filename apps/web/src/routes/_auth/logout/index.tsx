import i18n from '@/i18n/i18n'
import { Spinner } from '@/components/ui/spinner'
import { logoutService } from '@/services/authService'
import { createFileRoute, redirect } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_auth/logout/')({
  beforeLoad: async ({ context }) => {
    await logoutService()

    const { setUser, setAuthToken, setIsUserLoggedIn } =
      context.sessionStore.getState()

    setUser(null)
    setAuthToken(null)
    setIsUserLoggedIn(false)
    toast.success(i18n.t('auth:logout.successToast'))

    throw redirect({ to: '/' })
  },
  component: LogoutComponent,
  errorComponent: ErrorComponent
})

function LogoutComponent() {
  const { t } = useTranslation('auth')

  return (
    <div className="flex items-center justify-center gap-4">
      <Spinner />
      <p className="text-center">{t('logout.loggingOut')}</p>
    </div>
  )
}

function ErrorComponent() {
  const { t } = useTranslation('auth')

  return (
    <div className="flex items-center justify-center gap-4">
      <p className="text-destructive text-sm font-normal">
        {t('logout.error')}
      </p>
    </div>
  )
}
