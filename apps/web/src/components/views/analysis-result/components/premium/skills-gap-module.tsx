import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type SkillsGapModuleProps = {
  data: PremiumModules['skills_gap']
}

export function SkillsGapModule({ data }: SkillsGapModuleProps) {
  const { t } = useTranslation('analysis')
  const { gaps, learning_plan, certifications } = data

  return (
    <PremiumCard
      title={t('premium.skillsGap.title')}
      description={t('premium.skillsGap.description')}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <ListBlock title={t('premium.skillsGap.gaps')} items={gaps} />
        <ListBlock
          title={t('premium.skillsGap.learningPlan')}
          items={learning_plan}
        />
        <ListBlock
          title={t('premium.skillsGap.certifications')}
          items={certifications}
        />
      </div>
    </PremiumCard>
  )
}
