import { Worker, type Job } from 'bullmq'
import { bullMqConnectionOptions, redisClient } from '../config/redis.config'
import { analyzeFile } from '../controllers/helper/analyze/analyzeFile'
import { logger, prisma } from '../server'

export type AnalyzeJobData = {
  extractedText: string
  isPremium: boolean
  userId: string | null
  fileName: string | undefined
  fileSize: number | undefined
  ipAddress: string | undefined
  userAgent: string | undefined
}

const RESULT_TTL_SECONDS = 60 * 60

async function processAnalyzeJob(job: Job<AnalyzeJobData>) {
  const {
    extractedText,
    isPremium,
    userId,
    fileName,
    fileSize,
    ipAddress,
    userAgent
  } = job.data
  const jobId = job.id

  await prisma.analysisJob.update({
    where: { id: jobId },
    data: { status: 'PROCESSING' }
  })

  const analysisResult = await analyzeFile(extractedText, {
    premium: isPremium
  })

  if ('error' in analysisResult) {
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', error: analysisResult.error }
    })
    return
  }

  const resultData = {
    ...analysisResult,
    parsed_file: extractedText,
    user: userId ? { id: userId } : null
  }

  await redisClient.setex(
    `result:${jobId}`,
    RESULT_TTL_SECONDS,
    JSON.stringify(resultData)
  )

  await prisma.analysisJob.update({
    where: { id: jobId },
    data: { status: 'COMPLETED', resultId: analysisResult.id }
  })

  if (userId) {
    const decodedFileName = fileName
      ? Buffer.from(fileName, 'latin1').toString('utf8')
      : null

    await prisma.user.update({
      where: { id: userId },
      data: {
        requestLogs: {
          create: {
            analyseId: analysisResult.id,
            fileName: decodedFileName,
            fileSize: fileSize ?? null,
            isPremiumRequest: isPremium,
            ipAddress: ipAddress ?? null,
            userAgent: userAgent ?? null
          }
        }
      }
    })
  }
}

export const createAnalyzeWorker = () => {
  const worker = new Worker<AnalyzeJobData>('analyze', processAnalyzeJob, {
    connection: bullMqConnectionOptions,
    removeOnComplete: { count: 0 },
    removeOnFail: { count: 100 }
  })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Analysis job failed unexpectedly')
  })

  return worker
}
