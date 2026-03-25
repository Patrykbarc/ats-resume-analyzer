import { Card } from '@/components/ui/card'
import { RequestLimitError } from '../../ui/request-limit-error'
import { AnalyzeFile } from './components/analyze-file'
import { RequestsLeft } from './components/requests-left'
import { UploadFile } from './components/upload-file'
import { useAnalyzer } from './hooks/useAnalyzer'

export function ResumeAnalyzer() {
  const {
    shouldShowError,
    file,
    handleAnalyse,
    handleFileChange,
    handleReset,
    validationError,
    mutationError,
    isPending
  } = useAnalyzer()

  if (!isPending && shouldShowError) {
    return <RequestLimitError />
  }

  return (
    <div className="space-y-8">
      <Card className="border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          {!file ? (
            <UploadFile handleFileChange={handleFileChange} />
          ) : (
            <AnalyzeFile
              file={file}
              analyzing={isPending}
              handlers={{ handleReset, handleAnalyse }}
            />
          )}
          <RequestsLeft />
        </div>

        {validationError && (
          <p className="text-center text-rose-400">{validationError}</p>
        )}

        {mutationError && (
          <p className="text-center text-rose-400">{mutationError}</p>
        )}
      </Card>
    </div>
  )
}
