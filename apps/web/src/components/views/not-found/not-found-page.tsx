import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '../../ui/button'

export function NotFoundPage() {
  const { t } = useTranslation('errors')

  return (
    <div className="grid h-full items-center pb-18">
      <div>
        <div className="mb-8 text-center">
          <p className="text-9xl font-bold text-accent mb-4">404</p>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('notFound.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('notFound.description')}
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}
          >
            {t('buttons.backToHome', { ns: 'common' })}
          </Link>
        </div>
      </div>
    </div>
  )
}
