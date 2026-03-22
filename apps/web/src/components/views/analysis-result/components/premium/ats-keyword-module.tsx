import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type AtsKeywordModuleProps = {
  data: PremiumModules['ats_keyword_match']
}

export function AtsKeywordModule({ data }: AtsKeywordModuleProps) {
  const { t } = useTranslation('analysis')
  const { target_role, matched_keywords, missing_keywords, optimization_tips } =
    data

  return (
    <PremiumCard
      title={t('premium.atsKeyword.title')}
      description={t('premium.atsKeyword.description')}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('premium.atsKeyword.targetRole')}{' '}
          <span className="font-semibold text-foreground">
            {target_role || t('premium.atsKeyword.notDetected')}
          </span>
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <ListBlock
            title={t('premium.atsKeyword.matchedKeywords')}
            items={matched_keywords}
          />
          <ListBlock
            title={t('premium.atsKeyword.missingKeywords')}
            items={missing_keywords}
          />
        </div>
        <ListBlock
          title={t('premium.atsKeyword.optimizationTips')}
          items={optimization_tips}
        />
      </div>
    </PremiumCard>
  )
}
