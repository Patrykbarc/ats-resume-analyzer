import { RegisterForm } from '@/components/views/auth/forms/register-form'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/register/')({
  component: RegisterForm,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Register')
      }
    ]
  })
})
