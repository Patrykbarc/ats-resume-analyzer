import { Queue } from 'bullmq'
import { bullMqConnectionOptions } from './redis.config'

export const analyzeQueue = new Queue('analyze', {
  connection: bullMqConnectionOptions
})
