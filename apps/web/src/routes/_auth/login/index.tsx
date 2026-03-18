import { LoginForm } from '@/components/views/auth/login-form'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { LoginSearchSchema } from '@monorepo/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
  validateSearch: LoginSearchSchema,
  component: LoginPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Login')
      }
    ]
  })
})

function LoginPage() {
  return (
    <>
      <LoginForm />
    </>
  )
}
