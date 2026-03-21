import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SessionState } from '@/stores/session/useSessionStore'
import i18n from '@/i18n/i18n'

type NavLinks = {
  href: string
  label: string
  className?: string
}

type GetNavLinksProps = {
  isUserLoggedIn: SessionState['isUserLoggedIn']
  isPremium: SessionState['isPremium']
  highlightCta?: boolean
}

export const getNavLinks = ({
  isUserLoggedIn,
  isPremium,
  highlightCta
}: GetNavLinksProps) => {
  const t = i18n.t.bind(i18n)

  const pricingLink: NavLinks = {
    href: '/pricing',
    label: t('nav.pricing'),
    className: highlightCta
      ? cn('text-primary', buttonVariants({ variant: 'default' }))
      : undefined
  }

  const accountLink: NavLinks = { href: '/account', label: t('nav.account') }

  const authLinks: NavLinks[] = [
    { href: '/login', label: t('nav.login') },
    { href: '/register', label: t('nav.signup') }
  ]

  const pricingOptionLink = !isPremium && pricingLink

  if (isUserLoggedIn) {
    return [
      pricingOptionLink,
      accountLink,
      { href: '/logout', label: t('nav.logout') }
    ]
  }

  return [pricingLink, ...authLinks]
}
