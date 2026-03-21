import { Button, buttonVariants } from '@/components/ui/button'
import { useResendVerificationLink } from '@/hooks/useResendVerificationLink'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { verifyUserService } from '@/services/authService'
import { VerifyUserSchema } from '@monorepo/schemas'
import { sentryLogger } from '@monorepo/sentry-logger'
import {
  createFileRoute,
  Link,
  useLoaderData,
  useNavigate,
  useParams
} from '@tanstack/react-router'
import { StatusCodes } from 'http-status-codes'
import { CircleCheck, CircleX } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/(app)/verify/$token')({
  component: RouteComponent,
  validateSearch: VerifyUserSchema,
  loader: async ({ params }) => {
    const { token } = params

    return verifyUserService({ token })
  },
  head: () => ({
    meta: [
      {
        title: buildPageTitle('Verify Account')
      }
    ]
  })
})

function RouteComponent() {
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

function VerificationStatus({
  message,
  icon,
  children
}: {
  message: string
  icon?: 'SUCCESS' | 'ERROR'
  children?: ReactNode
}) {
  return (
    <div className="text-center">
      {icon && (
        <div className="flex justify-center mb-4">
          {icon === 'ERROR' ? (
            <CircleX className="text-rose-400 size-12" />
          ) : (
            <CircleCheck className="text-green-400 size-12" />
          )}
        </div>
      )}
      <p>{message}</p>

      {children}
    </div>
  )
}
