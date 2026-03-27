import { Button } from '@/components/ui/button'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { FileSearchIcon, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type AnalyseFileProps = {
  file: File
  analyzing: boolean
  handlers: {
    handleReset: () => void
    handleAnalyse: () => void
  }
}

export function AnalyzeFile({
  file,
  analyzing,
  handlers: { handleReset, handleAnalyse }
}: AnalyseFileProps) {
  const { t } = useTranslation('resumeAnalyzer')
  const { isPremium } = useSessionStore()
  const { isCooldownActive, requestsLeft } = useRateLimit()
  const isLimitReached = requestsLeft === 0 || isCooldownActive

  return (
    <>
      <div className="flex size-24 items-center justify-center rounded-full bg-secondary">
        <FileSearchIcon className="size-10  text-muted-foreground" />
      </div>

      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          {file.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAnalyse}
          disabled={analyzing || isLimitReached}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {analyzing ? (
            <>
              <Sparkles className="mr-2 size-4 animate-spin" />
              <p>{t('analyze.analyzing')}</p>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              {isPremium ? (
                <p>{t('analyze.proAnalyze')}</p>
              ) : (
                <p>{t('analyze.analyze')}</p>
              )}
            </>
          )}
        </Button>

        <Button onClick={handleReset} variant="outline">
          {t('analyze.cancel')}
        </Button>
      </div>
    </>
  )
}
