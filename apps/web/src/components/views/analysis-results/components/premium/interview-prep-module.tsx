import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type InterviewPrepModuleProps = {
  data: PremiumModules['interview_prep']
}

export function InterviewPrepModule({ data }: InterviewPrepModuleProps) {
  const { t } = useTranslation('analysis')
  const {
    elevator_pitch,
    likely_questions,
    stories_to_prepare,
    metrics_to_cite
  } = data

  return (
    <PremiumCard
      title={t('premium.interviewPrep.title')}
      description={t('premium.interviewPrep.description')}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t('premium.interviewPrep.elevatorPitch')}
          </p>
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {elevator_pitch}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ListBlock
            title={t('premium.interviewPrep.likelyQuestions')}
            items={likely_questions}
          />
          <ListBlock
            title={t('premium.interviewPrep.storiesToPrepare')}
            items={stories_to_prepare}
          />
        </div>

        <ListBlock
          title={t('premium.interviewPrep.metricsToCite')}
          items={metrics_to_cite}
        />
      </div>
    </PremiumCard>
  )
}
