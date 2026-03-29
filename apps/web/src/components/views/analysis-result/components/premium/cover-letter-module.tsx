import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type CoverLetterModuleProps = {
  data: PremiumModules['cover_letter']
}

export function CoverLetterModule({ data }: CoverLetterModuleProps) {
  const { t } = useTranslation('analysis')
  const { analysis, outline } = data

  return (
    <PremiumCard
      title={t('premium.coverLetter.title')}
      description={t('premium.coverLetter.description')}
    >
      <div className="space-y-4">
        <ListBlock
          title={t('premium.coverLetter.fitAnalysis')}
          items={analysis}
        />

        <div className="grid gap-3 md:grid-cols-3">
          <ListBlock
            title={t('premium.coverLetter.hook')}
            items={[outline.hook]}
          />
          <ListBlock
            title={t('premium.coverLetter.body')}
            items={[outline.body]}
          />
          <ListBlock
            title={t('premium.coverLetter.close')}
            items={[outline.close]}
          />
        </div>
      </div>
    </PremiumCard>
  )
}
