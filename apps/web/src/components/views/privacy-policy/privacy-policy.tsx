import { Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getSectionsData } from './helper/sections-data'

export function PrivacyPolicyPage() {
  const { t } = useTranslation('privacy')
  const sections = getSectionsData(t)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
          {t('header.title')}
        </h1>
      </header>

      <nav
        className="mb-12 rounded-lg border border-border bg-muted/30 p-6"
        aria-labelledby="toc-heading"
      >
        <h2
          id="toc-heading"
          className="mb-4 text-xl font-semibold text-foreground"
        >
          {t('header.toc')}
        </h2>
        <ol className="space-y-2 text-muted-foreground">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="hover:text-primary transition-colors"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-lg border border-border bg-card p-6 sm:p-8"
            aria-labelledby={`${section.id}-heading`}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <section.icon
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <h2
                id={`${section.id}-heading`}
                className="text-2xl font-semibold text-card-foreground"
              >
                {section.title}
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
