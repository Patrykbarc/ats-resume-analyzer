import { FREE_REQUESTS_PER_DAY } from '@monorepo/constants'
import rateLimit from 'express-rate-limit'
import { getEnvs } from '../lib/getEnv'

const THIRTY_SECONDS_IN_MS = 30 * 1000
const QUARTER_HOUR = 15 * 60 * 1000
const DAY = 24 * 60 * 60 * 1000

const { NODE_ENV } = getEnvs()

const requestLimiter = rateLimit({
  windowMs: QUARTER_HOUR,
  max: 100,
  message: {
    error: 'Too many requests, please try again later.'
  },
  validate: { trustProxy: false }
})

const analyzeLimiter = rateLimit({
  windowMs: DAY,
  max: NODE_ENV === 'development' ? Infinity : FREE_REQUESTS_PER_DAY,
  message: {
    error: 'The limit of analyses has been reached.'
  },
  validate: { trustProxy: false }
})

const authAttemptLimiter = rateLimit({
  windowMs: THIRTY_SECONDS_IN_MS,
  max: 5,
  message: {
    error: 'Too many attempts, please try again later.'
  },
  validate: { trustProxy: false }
})

const userAnalyzeLimiter = rateLimit({
  windowMs: DAY,
  max: NODE_ENV === 'development' ? Infinity : FREE_REQUESTS_PER_DAY,
  message: {
    error: 'The limit of analyses has been reached.'
  },
  validate: { trustProxy: false },
  keyGenerator: (req) =>
    (req.user as { id?: string } | undefined)?.id ?? req.ip ?? 'unknown'
})

export {
  analyzeLimiter,
  authAttemptLimiter,
  requestLimiter,
  userAnalyzeLimiter
}
