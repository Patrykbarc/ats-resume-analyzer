import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload } from 'lucide-react'
import { ChangeEvent, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useDragAndDrop } from '../hooks/useDragAndDrop'

type UploadFileProps = {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleFileDrop: (file: File) => void
}

export function UploadFile({
  handleFileChange,
  handleFileDrop
}: UploadFileProps) {
  const { t } = useTranslation('resumeAnalyzer')
  const id = useId()
  const {
    handler: { onDragLeave, onDragOver, onDrop },
    isDragging
  } = useDragAndDrop(handleFileDrop)

  return (
    <div
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'flex flex-col size-full items-center justify-center space-y-6 rounded-lg border-2 border-dashed p-8 transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-transparent'
      )}
    >
      <div className="flex size-24 items-center justify-center rounded-full bg-secondary">
        <Upload className="size-10 text-muted-foreground" />
      </div>

      <div className="text-center">
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          {t('upload.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('upload.format')}</p>
        <p className="text-sm text-muted-foreground">{t('upload.maxSize')}</p>
      </div>

      <label htmlFor={id}>
        <Button asChild>
          <span>{t('upload.chooseFile')}</span>
        </Button>
        <input
          id={id}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>
    </div>
  )
}
