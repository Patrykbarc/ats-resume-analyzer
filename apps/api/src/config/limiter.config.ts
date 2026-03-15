import { FREE_REQUESTS_PER_DAY } from '@monorepo/constants'
import rateLimit, { ipKeyGenerator, MemoryStore } from 'express-rate-limit'
import { getEnvs } from '../lib/getEnv'

export const analyzeStore = new MemoryStore()
export const userAnalyzeStore = new MemoryStore()

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
  validate: { trustProxy: true }
})

const analyzeLimiter = rateLimit({
  store: analyzeStore,
  windowMs: DAY,
  max: NODE_ENV === 'development' ? Infinity : FREE_REQUESTS_PER_DAY,
  message: {
    error: 'The limit of analyses has been reached.'
  },
  validate: { trustProxy: true }
})

const authAttemptLimiter = rateLimit({
  windowMs: THIRTY_SECONDS_IN_MS,
  max: 5,
  message: {
    error: 'Too many attempts, please try again later.'
  },
  validate: { trustProxy: true }
})

const userAnalyzeLimiter = rateLimit({
  store: userAnalyzeStore,
  windowMs: DAY,
  max: NODE_ENV === 'development' ? Infinity : FREE_REQUESTS_PER_DAY,
  message: {
    error: 'The limit of analyses has been reached.'
  },
  validate: { trustProxy: true },
  keyGenerator: (req) =>
    (req.user as { id?: string } | undefined)?.id ??
    ipKeyGenerator(req.ip ?? 'unknown')
})

export {
  analyzeLimiter,
  authAttemptLimiter,
  ipKeyGenerator,
  requestLimiter,
  userAnalyzeLimiter
}
