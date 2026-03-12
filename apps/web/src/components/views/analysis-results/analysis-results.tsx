import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useGetParsedFile } from '@/hooks/useGetParsedFile'
import { AnalysisDetails } from '@/services/analyseService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { lazy, Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { ShareButton } from '../share-button'
import { AnalysisCardsSkeleton } from './components/analysis-results-skeleton'
import { AnalysisSummary } from './components/analysis-summary'
import { CallToActionCard } from './components/call-to-action-card'

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
  const { user } = useSessionStore()
  const analysisOwner = analysis.user?.id

  const shouldDisablePreview = user?.id === analysisOwner ? false : true
  const isOwner = !shouldDisablePreview
  const { data: parsedFileData, isLoading: isParsedFileLoading } = useGetParsedFile(analysis.id, isOwner)

  return (
    <Tabs className="space-y-6" defaultValue={TABS.analyse.value}>
      <TabsList>
        <TabsTrigger value={TABS.analyse.value}>
          {TABS.analyse.trigger}
        </TabsTrigger>
        <TabsTrigger value={TABS.preview.value} disabled={shouldDisablePreview}>
          <Tooltip>
            <TooltipTrigger asChild>
              <p>{TABS.preview.trigger}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>Preview available to owner only</p>
            </TooltipContent>
          </Tooltip>
        </TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-6" value={TABS.analyse.value}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Analysis Results
          </h2>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<AnalysisCardsSkeleton />}>
            <AnalysisSections sections={analysis.sections} />
          </Suspense>

          {analysis.premium_modules ? (
            <PremiumModules premium={analysis.premium_modules} />
          ) : (
            <CallToActionCard />
          )}
        </div>

        <AnalysisSummary
          score={analysis.overall_score.score}
          justification={analysis.overall_score.justification}
        />
      </TabsContent>

      {!shouldDisablePreview && (
        <TabsContent className="space-y-6" value={TABS.preview.value}>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Preview</h2>
            <p className="text-muted-foreground max-w-3xl text-pretty">
              This is the raw, unformatted text extracted from your document.
              ATS systems analyze this exact content, meaning any errors in
              parsing (like missing formatting or broken line breaks) can
              severely impact their ability to read key information.
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
        </TabsContent>
      )}

      <ShareButton id={analysis.id} />
    </Tabs>
  )
}
