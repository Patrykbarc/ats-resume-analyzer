import type { PremiumModules } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

import { ListBlock } from './list-block'
import { PremiumCard } from './premium-card'

type ExportModuleProps = {
  data: PremiumModules['export']
}

export function ExportModule({ data }: ExportModuleProps) {
  const { t } = useTranslation('analysis')
  const { pdf_outline, priority_order, notes } = data

  return (
    <PremiumCard
      title={t('premium.export.title')}
      description={t('premium.export.description')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock title={t('premium.export.pdfOutline')} items={pdf_outline} />
        <ListBlock
          title={t('premium.export.priorityOrder')}
          items={priority_order}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {t('premium.export.notes')}
        </p>
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {notes}
        </p>
      </div>
    </PremiumCard>
  )
}
