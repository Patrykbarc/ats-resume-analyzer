import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AiAnalysis } from '@monorepo/types'
import { useTranslation } from 'react-i18next'

type OverallScore = AiAnalysis['overall_score']

type AnalysisSummaryProps = {
  score: OverallScore['score']
  justification: OverallScore['justification']
}

export function AnalysisSummary({
  score,
  justification
}: AnalysisSummaryProps) {
  const { t } = useTranslation('analysis')

  return (
    <Card>
      <CardContent>
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          {t('summary.overallScore')}
        </h3>
        <div className="grid text-end gap-3">
          <Progress value={+score} />
          <span className="text-xl font-bold">
            {t('history.analysisScore', { score })}
          </span>
        </div>
        <p className="mt-3  text-muted-foreground">{justification}</p>
      </CardContent>
    </Card>
  )
}
