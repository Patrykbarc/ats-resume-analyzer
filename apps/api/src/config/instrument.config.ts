import * as Sentry from '@sentry/node'
import { getEnvs } from '../lib/getEnv'

Sentry.init({
  dsn: getEnvs().SENTRY_DSN,
  sendDefaultPii: true
})
