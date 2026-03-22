import { ForgotPasswordForm } from '@/components/views/auth/forms/forgot-password-form'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/forgot-password/')({
  component: ForgotPasswordForm,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Forgot Password')
      }
    ]
  })
})
