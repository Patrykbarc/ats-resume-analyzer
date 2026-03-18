import { Button, buttonVariants } from '@/components/ui/button'
import { useCheckoutMutation } from '@/hooks/checkout/useCheckoutMutation'
import { getEnvs } from '@/lib/getEnv'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { sentryLogger } from '@monorepo/sentry-logger'
import { Link, useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Pro Analyst',
    description: 'Everything you need to land your dream job',
    price: 14.99,
    period: 'month',
    features: [
      'Unlimited resume analyses per month',
      'GPT-4 powered deep-dive analysis',
      'ATS optimization with keyword matching',
      'Content & structure recommendations',
      'Cover letter analysis & generation',
      'Interview preparation guide',
      'LinkedIn profile optimization tips',
      'Skills gap analysis',
      'Salary negotiation insights',
      'Career path recommendations'
    ],
    cta: {
      title: 'Get started',
      url: getEnvs().VITE_PAYMENT_PUBLIC_KEY
    }
  }
] as const

export type PricingPlan = typeof plans

export function PricingCardList({
  showFeatures = true,
  className
}: {
  showFeatures?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex max-w-md mx-auto', className)}>
      {plans.map((plan) => (
        <PricingCard key={plan.name} showFeatures={showFeatures} {...plan} />
      ))}
    </div>
  )
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  showFeatures
}: PricingPlan[number] & { showFeatures: boolean }) {
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
      className="relative rounded-lg bg-card border overflow-hidden border-primary ring-accent w-full"
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
        {isUserLoggedIn ? (
          <Button
            onClick={handleCheckoutMutation}
            className="w-full font-semibold"
          >
            {cta.title}
          </Button>
        ) : (
          <Link
            className={buttonVariants({ variant: 'default' })}
            to="/login"
            search={{ redirect: '/pricing' }}
          >
            {cta.title}
          </Link>
        )}

        {/* Features List */}
        {showFeatures && (
          <div className="space-y-4 mt-8">
            {features.map((feature) => (
              <div key={feature} className="flex gap-3">
                <Check className="size-5 shrink-0 text-accent" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
