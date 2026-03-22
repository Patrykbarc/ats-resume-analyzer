import { ErrorCheckoutPage } from '@/components/views/payment-verification/payment-verification-error-page'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/checkout/cancel/')({
  component: ErrorCheckoutPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Order cancelled')
      }
    ]
  })
})
