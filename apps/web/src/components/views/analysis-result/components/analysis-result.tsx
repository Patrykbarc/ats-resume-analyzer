import { Card, CardContent } from '@/components/ui/card'
import { useGetParsedFile } from '@/hooks/useGetParsedFile'
import { AnalysisDetails } from '@/services/analyseService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs'
import { AnalysisSummary } from './analysis-summary'
import { PricingCardList } from './pricing-card-list'
import { AnalysisCardsSkeleton } from './skeletons/analysis-results-skeleton'

const AnalysisSections = lazy(() =>
  import('./analysis-sections').then((module) => ({
    default: module.AnalysisSections
  }))
)

const PremiumModules = lazy(() =>
  import('./premium/premium-modules').then((module) => ({
    default: module.PremiumModules
  }))
)

const TABS = {
  analyse: {
    trigger: 'Analysis',
    value: 'analyse'
  },
  preview: {
    trigger: 'Parsed file preview',
    value: 'preview'
  }
}

type AnalysisResultsProps = {
  analysis: AnalysisDetails
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { user } = useSessionStore()
  const analysisOwner = analysis.user?.id

  const isOwner = !!user && !!analysisOwner && user.id === analysisOwner
  const { data, isLoading } = useGetParsedFile(analysis.id, isOwner)

  return (
    <Tabs className="space-y-6" defaultValue={TABS.analyse.value}>
      {isOwner && (
        <TabsList>
          <TabsTrigger value={TABS.analyse.value}>
            {TABS.analyse.trigger}
          </TabsTrigger>

          <TabsTrigger value={TABS.preview.value}>
            {TABS.preview.trigger}
          </TabsTrigger>
        </TabsList>
      )}

      <TabsContent className="space-y-6" value={TABS.analyse.value}>
        <AnalysisSummaryPreviewTab analysis={analysis} />
      </TabsContent>

      {isOwner && (
        <TabsContent className="space-y-6" value={TABS.preview.value}>
          <ParsedFilePreviewTab
            isParsedFileLoading={isLoading}
            parsedFileData={data}
          />
        </TabsContent>
      )}
    </Tabs>
  )
}

function AnalysisSummaryPreviewTab({
  analysis
}: {
  analysis: AnalysisDetails
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
      </div>
      <div className="space-y-6">
        <Suspense fallback={<AnalysisCardsSkeleton />}>
          <AnalysisSections sections={analysis.sections} />
        </Suspense>

        {analysis.premium_modules ? (
          <PremiumModules premium={analysis.premium_modules} />
        ) : (
          <PricingCardList className="max-w-full" showFeatures={false} />
        )}
      </div>
      <AnalysisSummary
        score={analysis.overall_score.score}
        justification={analysis.overall_score.justification}
      />
    </>
  )
}

function ParsedFilePreviewTab({
  isParsedFileLoading,
  parsedFileData
}: {
  isParsedFileLoading: boolean
  parsedFileData: ReturnType<typeof useGetParsedFile>['data']
}) {
  const { t } = useTranslation('analysis')

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {t('filePreview.title')}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-pretty">
          {t('filePreview.description')}
        </p>
      </div>

      <Card>
        <CardContent>
          {isParsedFileLoading ? (
            <p className="text-muted-foreground">{t('filePreview.loading')}</p>
          ) : (
            <p className="whitespace-pre-line">{parsedFileData?.parsed_file}</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
