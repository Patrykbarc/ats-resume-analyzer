import { LoginForm } from '@/components/views/auth/forms/login-form'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { LoginSearchSchema } from '@monorepo/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
  validateSearch: LoginSearchSchema,
  component: LoginForm,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Login')
      }
    ]
  })
})
