import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { NavItems } from './components/nav-items'

export function Footer() {
  const { t } = useTranslation('common')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-1 md:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {t('footer.title')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <nav aria-label="Footer Navigation">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              {t('footer.quickLinks')}
            </h3>
            <NavItems className="space-y-3 text-sm text-muted-foreground">
              <Link to="/privacy-policy">{t('footer.privacyPolicy')}</Link>
            </NavItems>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  )
}
