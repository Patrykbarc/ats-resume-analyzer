import { getEnvs } from '@/lib/getEnv'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: getEnvs().VITE_SENTRY_DSN,
  sendDefaultPii: true
})
