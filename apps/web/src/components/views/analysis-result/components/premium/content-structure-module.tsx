import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type ContentStructureModuleProps = {
  data: PremiumModules['content_and_structure']
}

export function ContentStructureModule({ data }: ContentStructureModuleProps) {
  const { t } = useTranslation('analysis')
  const { format_issues, structure_recommendations, content_gaps } = data

  return (
    <PremiumCard
      title={t('premium.contentStructure.title')}
      description={t('premium.contentStructure.description')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock
          title={t('premium.contentStructure.formatIssues')}
          items={format_issues}
        />
        <ListBlock
          title={t('premium.contentStructure.structureRecommendations')}
          items={structure_recommendations}
        />
      </div>
      <ListBlock
        title={t('premium.contentStructure.contentGaps')}
        items={content_gaps}
      />
    </PremiumCard>
  )
}
