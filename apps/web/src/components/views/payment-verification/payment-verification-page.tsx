import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'

export function PaymentVerificationPage() {
  const { t } = useTranslation('checkout')

  return (
    <div className="p-4 gap-3 flex justify-center items-center mx-auto">
      <Spinner />
      <p>{t('success.verifying.title')}</p>
    </div>
  )
}
