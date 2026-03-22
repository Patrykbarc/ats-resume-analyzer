import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '../../ui/button'

type Props = {
  resetError: () => void
}

export function ErrorFallbackPage({ resetError }: Props) {
  const { t } = useTranslation('errors')

  return (
    <div className="grid h-full items-center pb-18">
      <div>
        <div className="mb-8 text-center">
          <p className="text-9xl font-bold text-accent mb-4">!</p>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('errorFallback.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('errorFallback.description')}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={resetError}
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            {t('buttons.tryAgain', { ns: 'common' })}
          </button>
          <a
            href="/"
            className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}
          >
            {t('buttons.backToHome', { ns: 'common' })}
          </a>
        </div>
      </div>
    </div>
  )
}
