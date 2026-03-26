import { Queue } from 'bullmq'
import { bullMqConnectionOptions } from './redis.config'

export const analyzeQueue = new Queue('analyze', {
  connection: bullMqConnectionOptions
})

analyzeQueue.on('error', (err) => {
  console.error('[Queue] analyzeQueue error:', err)
})
