import Redis from 'ioredis'
import { getEnvs } from '../lib/getEnv'

const { REDIS_URL } = getEnvs()

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null
})

redisClient.on('error', (err) => {
  console.error('[Redis] Client error:', err)
})

function parseRedisUrl(url: string) {
  const parsed = new URL(url)
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379'),
    ...(parsed.username
      ? { username: decodeURIComponent(parsed.username) }
      : {}),
    ...(parsed.password
      ? { password: decodeURIComponent(parsed.password) }
      : {}),
    ...(parsed.protocol === 'rediss:' ? { tls: {} } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    keepAlive: 10000
  }
}

export const bullMqConnectionOptions = parseRedisUrl(REDIS_URL)
