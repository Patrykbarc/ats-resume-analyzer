import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type LinkedinModuleProps = {
  data: PremiumModules['linkedin_profile']
}

export function LinkedinModule({ data }: LinkedinModuleProps) {
  const { t } = useTranslation('analysis')
  const { headline, about_summary, featured_keywords, action_items } = data

  return (
    <PremiumCard
      title={t('premium.linkedin.title')}
      description={t('premium.linkedin.description')}
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {t('premium.linkedin.headline')}
            </p>
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {headline}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {t('premium.linkedin.aboutSummary')}
            </p>
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {about_summary}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ListBlock
            title={t('premium.linkedin.featuredKeywords')}
            items={featured_keywords}
          />
          <ListBlock
            title={t('premium.linkedin.actionItems')}
            items={action_items}
          />
        </div>
      </div>
    </PremiumCard>
  )
}
