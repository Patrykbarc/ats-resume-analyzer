import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type CareerPathModuleProps = {
  data: PremiumModules['career_path']
}

export function CareerPathModule({ data }: CareerPathModuleProps) {
  const { t } = useTranslation('analysis')
  const { short_term_roles, mid_term_roles, long_term_roles, next_steps } = data

  return (
    <PremiumCard
      title={t('premium.careerPath.title')}
      description={t('premium.careerPath.description')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock
          title={t('premium.careerPath.shortTermRoles')}
          items={short_term_roles}
        />
        <ListBlock
          title={t('premium.careerPath.midTermRoles')}
          items={mid_term_roles}
        />
        <ListBlock
          title={t('premium.careerPath.longTermRoles')}
          items={long_term_roles}
        />
        <ListBlock
          title={t('premium.careerPath.nextSteps')}
          items={next_steps}
        />
      </div>
    </PremiumCard>
  )
}
