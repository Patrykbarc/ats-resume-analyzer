import Redis from 'ioredis'
import { getEnvs } from '../lib/getEnv'

const { REDIS_URL } = getEnvs()

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null
})

function parseRedisUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379'),
    ...(parsed.password
      ? { password: decodeURIComponent(parsed.password) }
      : {}),
    ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
    maxRetriesPerRequest: null as null
  }
}

export const bullMqConnectionOptions = parseRedisUrl(REDIS_URL)
