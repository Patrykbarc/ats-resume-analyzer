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

const MESSAGES = {
  ok: 'Your account has been verified. You can now log in.',
  gone: 'Your verification link has expired.',
  notFound: 'The verification link is invalid or has already been used.',
  unknown:
    'An unknown error occurred during verification. Please try again later.'
}

function RouteComponent() {
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
      <VerificationStatus icon="SUCCESS" message={MESSAGES.ok}>
        <Link className={buttonVariants({ variant: 'link' })} to="/login">
          Go to login page
        </Link>
      </VerificationStatus>
    )
  }

  if (status === StatusCodes.GONE) {
    return (
      <VerificationStatus icon="ERROR" message={MESSAGES.gone}>
        <Button onClick={() => mutate({ token })} variant="link">
          Request a new one.
        </Button>
      </VerificationStatus>
    )
  }

  if (status === StatusCodes.NOT_FOUND) {
    return (
      <VerificationStatus icon="ERROR" message={MESSAGES.notFound}>
        <Link className={buttonVariants({ variant: 'link' })} to="/">
          Return home
        </Link>
      </VerificationStatus>
    )
  }

  return (
    <VerificationStatus icon="ERROR" message={MESSAGES.unknown}>
      <Link className={buttonVariants({ variant: 'link' })} to="/">
        Return home
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
