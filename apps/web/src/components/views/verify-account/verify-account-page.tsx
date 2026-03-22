import { Button, buttonVariants } from '@/components/ui/button'
import { useResendVerificationLink } from '@/hooks/useResendVerificationLink'
import { sentryLogger } from '@monorepo/sentry-logger'
import {
  Link,
  useLoaderData,
  useNavigate,
  useParams
} from '@tanstack/react-router'
import { StatusCodes } from 'http-status-codes'
import { useTranslation } from 'react-i18next'
import { VerificationStatus } from './components/verification-status'

export function VerifyAccountPage() {
  const { t } = useTranslation('errors')
  const navigate = useNavigate()
  const { status } = useLoaderData({ from: '/(app)/verify/$token' })
  const { token } = useParams({ from: '/(app)/verify/$token' })
  const { mutate } = useResendVerificationLink({
    onSuccess: () => {
      navigate({ to: '/' })
    },
    onError: (err) => {
      sentryLogger.unexpected(err)
    }
  })

  if (status === StatusCodes.OK) {
    return (
      <VerificationStatus icon="SUCCESS" message={t('verify.ok')}>
        <Link className={buttonVariants({ variant: 'link' })} to="/login">
          {t('verify.goToLogin')}
        </Link>
      </VerificationStatus>
    )
  }

  if (status === StatusCodes.GONE) {
    return (
      <VerificationStatus icon="ERROR" message={t('verify.gone')}>
        <Button onClick={() => mutate({ token })} variant="link">
          {t('verify.requestNew')}
        </Button>
      </VerificationStatus>
    )
  }

  if (status === StatusCodes.NOT_FOUND) {
    return (
      <VerificationStatus icon="ERROR" message={t('verify.notFound')}>
        <Link className={buttonVariants({ variant: 'link' })} to="/">
          {t('verify.returnHome')}
        </Link>
      </VerificationStatus>
    )
  }

  return (
    <VerificationStatus icon="ERROR" message={t('verify.unknown')}>
      <Link className={buttonVariants({ variant: 'link' })} to="/">
        {t('verify.returnHome')}
      </Link>
    </VerificationStatus>
  )
}
