import { FREE_REQUESTS_PER_DAY } from '@monorepo/constants'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { getEnvs } from '../lib/getEnv'
import { redisClient } from './redis.config'

type RedisReply = boolean | number | string | (boolean | number | string)[]

const THIRTY_SECONDS_IN_MS = 30 * 1000
const DAY = 24 * 60 * 60 * 1000

const { NODE_ENV } = getEnvs()

const MAX_REQUESTS =
  NODE_ENV === 'development' ? Infinity : FREE_REQUESTS_PER_DAY

const analyzeStore = new RedisStore({
  sendCommand: (...args: string[]) =>
    redisClient.call(args[0] ?? '', ...args.slice(1)) as Promise<RedisReply>,
  prefix: 'rl:analyze:'
})

const userAnalyzeStore = new RedisStore({
  sendCommand: (...args: string[]) =>
    redisClient.call(args[0] ?? '', ...args.slice(1)) as Promise<RedisReply>,
  prefix: 'rl:user-analyze:'
})

const analyzeLimiter = rateLimit({
  store: analyzeStore,
  windowMs: DAY,
  max: MAX_REQUESTS,
  skipFailedRequests: true,
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
  max: MAX_REQUESTS,
  skipFailedRequests: true,
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
  userAnalyzeLimiter
}
