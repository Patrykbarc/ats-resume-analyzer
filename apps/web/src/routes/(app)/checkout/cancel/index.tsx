import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'
import { XCircle } from 'lucide-react'

export const Route = createFileRoute('/(app)/checkout/cancel/')({
  component: CancelledPage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Order cancelled')
      }
    ]
  })
})

function CancelledPage() {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10 animate-in zoom-in duration-500">
        <XCircle className="size-10 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
        Order Cancelled
      </h1>
      <p className="text-lg text-muted-foreground text-pretty">
        Your payment was not completed. No charges have been made to your
        account.
      </p>
      <p className="mt-4">
        <a href="/pricing" className="text-primary hover:underline font-medium">
          Try again or choose a different plan.
        </a>
      </p>
    </div>
  )
}
