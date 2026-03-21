import { FREE_REQUESTS_PER_DAY } from '@monorepo/constants'
import { useTranslation } from 'react-i18next'
import { faqKeys, FaqKey } from './constants/faq-data'

export function Faq() {
  const { t } = useTranslation('seo')

  return (
    <section>
      <div className="mx-auto">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          {t('faq.title')}
        </h2>
        <dl className="space-y-6">
          {faqKeys.map((key) => (
            <FaqItem key={key} faqKey={key} />
          ))}
        </dl>
      </div>
    </section>
  )
}

function FaqItem({ faqKey }: { faqKey: FaqKey }) {
  const { t } = useTranslation('seo')

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <dt className="mb-2 text-lg font-semibold text-card-foreground">
        {t(`faq.items.${faqKey}.question`)}
      </dt>
      <dd className="text-muted-foreground leading-relaxed">
        {t(`faq.items.${faqKey}.answer`, {
          freeRequests: FREE_REQUESTS_PER_DAY
        })}
      </dd>
    </div>
  )
}
