import { SuccessCheckoutPage } from '@/components/views/payment-verification/payment-verification-success-page'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { CheckoutSessionIdSchema } from '@monorepo/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/checkout/success/')({
  validateSearch: CheckoutSessionIdSchema,
  component: SuccessCheckoutPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Payment successful')
      }
    ]
  })
})
