import {
  LogoutPage,
  LogoutPageError
} from '@/components/views/auth/logout-page'
import i18n from '@/i18n/i18n'
import { logoutService } from '@/services/authService'
import { createFileRoute, redirect } from '@tanstack/react-router'
import toast from 'react-hot-toast'

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
  component: LogoutPage,
  errorComponent: LogoutPageError
})
