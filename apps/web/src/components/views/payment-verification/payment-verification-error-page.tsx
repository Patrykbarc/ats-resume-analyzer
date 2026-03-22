import { XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type ErrorCheckoutPageProps = {
  title?: string
  message?: string
}

export function ErrorCheckoutPage({ title, message }: ErrorCheckoutPageProps) {
  const { t } = useTranslation('checkout')

  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10 animate-in zoom-in duration-500">
        <XCircle className="size-10 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
        {title ?? t('cancel.title')}
      </h1>
      <p className="text-lg text-muted-foreground text-pretty">
        {message ?? t('cancel.description')}
      </p>
      <p className="mt-4">
        <a href="/pricing" className="text-primary hover:underline font-medium">
          {t('cancel.tryAgain')}
        </a>
      </p>
    </div>
  )
}
