import { FieldError } from '@/components/ui/field'
import { AxiosError } from 'axios'
import { StatusCodes } from 'http-status-codes'
import { useTranslation } from 'react-i18next'

export function AuthErrorMessages({ error }: { error: AxiosError }) {
  const { t } = useTranslation('auth')

  if (error?.status === StatusCodes.UNAUTHORIZED) {
    return <FieldError>{t('errors.invalidCredentials')}</FieldError>
  }

  if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
    return <FieldError>{t('errors.tooManyAttempts')}</FieldError>
  }

  if (error?.status === StatusCodes.FORBIDDEN) {
    return (
      <FieldError>
        {t('errors.unconfirmedAccount')}
        <br />
        {t('errors.checkEmailVerification')}
      </FieldError>
    )
  }

  if (error?.status === StatusCodes.CONFLICT) {
    return <FieldError>{t('errors.emailExists')}</FieldError>
  }

  return <FieldError>{t('errors.generic')}</FieldError>
}
