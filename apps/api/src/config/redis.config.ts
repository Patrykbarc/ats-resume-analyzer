import Redis from 'ioredis'
import { getEnvs } from '../lib/getEnv'

const { REDIS_URL } = getEnvs()

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null
})

redisClient.on('error', (err) => {
  console.error('[Redis] Client error:', err)
})
