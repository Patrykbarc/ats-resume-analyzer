import { Button, buttonVariants } from '@/components/ui/button'
import { useCheckoutMutation } from '@/hooks/checkout/useCheckoutMutation'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { sentryLogger } from '@monorepo/sentry-logger'
import { Link, useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PricingCardList({
  showFeatures = true,
  className
}: {
  showFeatures?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex max-w-md mx-auto', className)}>
      <PricingCard showFeatures={showFeatures} />
    </div>
  )
}

function PricingCard({ showFeatures }: { showFeatures: boolean }) {
  const { t } = useTranslation('pricing')
  const navigate = useNavigate()
  const { isUserLoggedIn } = useSessionStore()
  const { user } = useSessionStore()

  const features = t('plan.features', { returnObjects: true }) as string[]

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
    <div className="relative rounded-lg bg-card border overflow-hidden border-primary ring-accent w-full">
      <div className="absolute -right-12 top-6 rotate-45 bg-primary px-12 py-1 text-xs font-semibold text-background">
        {t('plan.recommended')}
      </div>

      <div className="flex flex-col px-6 py-8 h-full">
        <div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            {t('plan.name')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('plan.description')}
          </p>
        </div>

        <div className="my-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground">$14.99</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>

        {isUserLoggedIn ? (
          <Button
            onClick={handleCheckoutMutation}
            className="w-full font-semibold"
          >
            {t('plan.cta')}
          </Button>
        ) : (
          <Link
            className={buttonVariants({ variant: 'default' })}
            to="/login"
            search={{ redirect: '/pricing' }}
          >
            {t('plan.cta')}
          </Link>
        )}

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

