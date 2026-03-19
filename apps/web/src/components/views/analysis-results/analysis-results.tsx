import { Card, CardContent } from '@/components/ui/card'
import { useGetParsedFile } from '@/hooks/useGetParsedFile'
import { AnalysisDetails } from '@/services/analyseService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { lazy, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { ShareButton } from '../share-button'
import { AnalysisCardsSkeleton } from './components/analysis-results-skeleton'
import { AnalysisSummary } from './components/analysis-summary'
import { PricingCardList } from './components/pricing-card-list'

const AnalysisSections = lazy(() =>
  import('./components/analysis-sections').then((module) => ({
    default: module.AnalysisSections
  }))
)

const PremiumModules = lazy(() =>
  import('./components/premium/premium-modules').then((module) => ({
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
  const { user, isPremium } = useSessionStore()
  const analysisOwner = analysis.user?.id

  const isOwner = user?.id === analysisOwner
  const canAccessPreview = isOwner && isPremium
  const { data: parsedFileData, isLoading: isParsedFileLoading } =
    useGetParsedFile(analysis.id, canAccessPreview)

  return (
    <Tabs className="space-y-6" defaultValue={TABS.analyse.value}>
      <TabsList>
        <TabsTrigger value={TABS.analyse.value}>
          {TABS.analyse.trigger}
        </TabsTrigger>
        <TabsTrigger value={TABS.preview.value}>
          {TABS.preview.trigger}
        </TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-6" value={TABS.analyse.value}>
        <AnalysisSummaryPreviewTab analysis={analysis} />
      </TabsContent>

      <TabsContent className="space-y-6" value={TABS.preview.value}>
        <ParsedFilePreviewTab
          canAccessPreview={canAccessPreview}
          isParsedFileLoading={isParsedFileLoading}
          parsedFileData={parsedFileData}
        />
      </TabsContent>

      {canAccessPreview && <ShareButton id={analysis.id} />}
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
  canAccessPreview,
  isParsedFileLoading,
  parsedFileData
}: {
  canAccessPreview: boolean
  isParsedFileLoading: boolean
  parsedFileData: ReturnType<typeof useGetParsedFile>['data']
}) {
  if (!canAccessPreview) {
    return (
      <>
        <h2 className="mb-6 text-2xl text-muted-foreground">
          To access the preview, please upgrade to a premium plan
        </h2>
        <PricingCardList className="max-w-full" showFeatures={false} />
      </>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Preview</h2>
        <p className="text-muted-foreground max-w-3xl text-pretty">
          This is the raw, unformatted text extracted from your document. ATS
          systems analyze this exact content, meaning any errors in parsing
          (like missing formatting or broken line breaks) can severely impact
          their ability to read key information.
        </p>
      </div>

      <Card>
        <CardContent>
          {isParsedFileLoading ? (
            <p className="text-muted-foreground">Loading preview...</p>
          ) : (
            <p className="whitespace-pre-line">{parsedFileData?.parsed_file}</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
