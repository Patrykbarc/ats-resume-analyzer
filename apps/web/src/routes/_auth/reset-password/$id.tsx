import { ResetPasswordForm } from '@/components/views/auth/forms/reset-password-form'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/reset-password/$id')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Reset Password')
      }
    ]
  })
})

function RouteComponent() {
  const { id } = useParams({ from: '/_auth/reset-password/$id' })

  return <ResetPasswordForm token={id} />
}
