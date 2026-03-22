import { VerifyAccountPage } from '@/components/views/verify-account/verify-account-page'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { verifyUserService } from '@/services/authService'
import { VerifyUserSchema } from '@monorepo/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/verify/$token')({
  component: VerifyAccountPage,
  validateSearch: VerifyUserSchema,
  loader: async ({ params }) => {
    const { token } = params

    return verifyUserService({ token })
  },
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Verify Account')
      }
    ]
  })
})
