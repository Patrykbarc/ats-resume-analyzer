import { PaymentVerificationPage } from '@/components/views/payment-verification/payment-verification-page'
import { checkoutSessionGuard } from '@/guards/checkoutSessionGuard'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { CheckoutSessionIdSchema } from '@monorepo/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/checkout/')({
  validateSearch: CheckoutSessionIdSchema,
  beforeLoad: async ({ search }) => await checkoutSessionGuard(search.id),
  component: PaymentVerificationPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Verifying payment...')
      }
    ]
  })
})
