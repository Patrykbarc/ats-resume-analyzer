import { queryClient } from '@/api/queryClient'
import {
  LogoutPage,
  LogoutPageError
} from '@/components/views/auth/logout-page'
import { REQUESTS_COOLDOWN_KEY, REQUESTS_LEFT_KEY } from '@/hooks/useRateLimit'
import i18n from '@/i18n/i18n'
import { logoutService } from '@/services/authService'
import { createFileRoute, redirect } from '@tanstack/react-router'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/_auth/logout/')({
  beforeLoad: async ({ context }) => {
    localStorage.removeItem(REQUESTS_LEFT_KEY)
    localStorage.removeItem(REQUESTS_COOLDOWN_KEY)

    await logoutService()

    const { resetUserState } = context.sessionStore.getState()

    resetUserState()
    queryClient.clear()

    toast.success(i18n.t('auth:logout.successToast'))

    throw redirect({ to: '/' })
  },
  component: LogoutPage,
  errorComponent: LogoutPageError
})
