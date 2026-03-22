import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'

export function LogoutPage() {
  const { t } = useTranslation('auth')

  return (
    <div className="flex items-center justify-center gap-4">
      <Spinner />
      <p className="text-center">{t('logout.loggingOut')}</p>
    </div>
  )
}

export function LogoutPageError() {
  const { t } = useTranslation('auth')

  return (
    <div className="flex items-center justify-center gap-4">
      <p className="text-destructive text-sm font-normal">
        {t('logout.error')}
      </p>
    </div>
  )
}
