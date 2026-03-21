import { ComponentType, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { featureData, FeatureKey } from './constants/feature-data'

export function Features() {
  const { t } = useTranslation('seo')

  return (
    <section className="mx-auto">
      <article className="rounded-lg border border-border bg-card p-6 sm:p-8">
        <h2 className="mb-4 text-2xl font-semibold text-card-foreground">
          {t('features.title')}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p className="text-pretty">{t('features.paragraph1')}</p>
          <p className="text-pretty">{t('features.paragraph2')}</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureData.map((feature) => (
            <FeatureItem
              key={feature.key}
              icon={feature.icon}
              featureKey={feature.key}
            />
          ))}
        </div>
      </article>
    </section>
  )
}

type FeatureItemProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  featureKey: FeatureKey
}

function FeatureItem({ icon: Icon, featureKey }: FeatureItemProps) {
  const { t } = useTranslation('seo')

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-card-foreground">
        {t(`features.items.${featureKey}.title`)}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t(`features.items.${featureKey}.description`)}
      </p>
    </div>
  )
}
