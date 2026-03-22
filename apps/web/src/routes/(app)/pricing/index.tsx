import PricingPage from '@/components/views/pricing/pricing-page'

import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/pricing/')({
  component: PricingPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Pricing')
      }
    ]
  })
})
