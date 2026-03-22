import { buttonVariants } from '@/components/ui/button'
import { getEnvs } from '@/lib/getEnv'
import { useTranslation } from 'react-i18next'
import { PricingCardList } from '../analysis-result/components/pricing-card-list'

export default function PricingPage() {
  const { VITE_CONTACT_EMAIL } = getEnvs()
  const { t } = useTranslation('faq')

  const brief = t('brief', { returnObjects: true })
  const faq = t('questions', { returnObjects: true })

  return (
    <div>
      <section>
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t('cta.title', { ns: 'pricing' })}
          </h1>
          <p className="mb-4 text-xl text-muted-foreground">
            {t('cta.description', { ns: 'pricing' })}
          </p>

          <div className="inline-flex flex-wrap justify-center gap-4">
            {brief.map((item) => {
              return (
                <span
                  key={item}
                  className="rounded-md bg-accent/40 px-4 py-2 text-sm font-medium text-muted-foreground"
                >
                  {item}
                </span>
              )
            })}
          </div>
        </div>

        <PricingCardList />
      </section>

      <section className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">
          {t('title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {faq.map((item) => (
            <div
              key={item.question}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h3 className="mb-2 font-semibold text-foreground">
                {item.question}
              </h3>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-foreground">
          {t('enterprise')}
        </h2>
        <p className="mb-6 text-muted-foreground">
          {t('enterpriseDescription')}
        </p>

        <a
          className={buttonVariants({ variant: 'outline' })}
          href={`mailto:${VITE_CONTACT_EMAIL}`}
        >
          {t('contactSales')}
        </a>
      </section>
    </div>
  )
}
