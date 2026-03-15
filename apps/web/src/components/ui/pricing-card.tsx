import { Button, buttonVariants } from '@/components/ui/button'
import { useCheckoutMutation } from '@/hooks/checkout/useCheckoutMutation'
import { cn } from '@/lib/utils'
import { PricingPlan } from '@/routes/(app)/pricing'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { sentryLogger } from '@monorepo/sentry-logger'
import { useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta
}: PricingPlan[number]) {
  const navigate = useNavigate()
  const { isUserLoggedIn } = useSessionStore()
  const { user } = useSessionStore()

  const { mutate } = useCheckoutMutation({
    onSuccess: ({ url }) => {
      if (url) {
        window.location.href = url
      }
    },
    onError: (err) => {
      sentryLogger.unexpected(err)
    }
  })

  const handleCheckoutMutation = () => {
    if (!user?.id || !isUserLoggedIn) {
      return navigate({ to: '/login' })
    }

    mutate({ id: user.id })
  }

  return (
    <div
      key={name}
      className={cn(
        'relative rounded-lg bg-card border overflow-hidden border-primary ring-accent'
      )}
    >
      <div className="absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-semibold text-background">
        Recommended
      </div>

      <div className="flex flex-col px-6 py-8 h-full">
        <div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Price */}
        <div className="my-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground">${price}</span>
          <span className="text-sm text-muted-foreground">/{period}</span>
        </div>

        {/* CTA Button */}
        <Button
          variant="secondary"
          onClick={handleCheckoutMutation}
          className={cn('mb-8 w-full font-semibold', buttonVariants())}
        >
          {cta.title}
        </Button>

        {/* Features List */}
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature} className="flex gap-3">
              <Check className="size-5 shrink-0 text-accent" />
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
