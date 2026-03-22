import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type SalaryInsightsModuleProps = {
  data: PremiumModules['salary_insights']
}

export function SalaryInsightsModule({ data }: SalaryInsightsModuleProps) {
  const { t } = useTranslation('analysis')
  const { range_estimate, negotiation_moves, risk_flags } = data

  return (
    <PremiumCard
      title={t('premium.salaryInsights.title')}
      description={t('premium.salaryInsights.description')}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t('premium.salaryInsights.rangeEstimate')}
          </p>
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {range_estimate}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ListBlock
            title={t('premium.salaryInsights.negotiationMoves')}
            items={negotiation_moves}
          />
          <ListBlock
            title={t('premium.salaryInsights.riskFlags')}
            items={risk_flags}
          />
        </div>
      </div>
    </PremiumCard>
  )
}
