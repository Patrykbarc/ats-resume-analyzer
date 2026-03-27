import { UserSchemaType } from '@monorepo/schemas'
import type { AiAnalysis } from '@monorepo/types'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { analyzeQueue } from '../config/queue.config'
import { redisClient } from '../config/redis.config'
import { logger, openAiClient, prisma } from '../server'
import {
  getAnalysisHistory as getAnalysisHistoryService,
  getAnalysisOwner
} from '../services/analyse.service'
import { isPremiumUser } from './helper/analyze/isPremiumUser'
import { parseFileAndSanitize } from './helper/analyze/parseFileAndSanitize'
import { parseOpenAiApiResponse } from './helper/analyze/parseOpenAiApiResponse'

export const createAnalyze = async (req: Request, res: Response) => {
  logger.debug(
    { ip: req.ip, forwarded: req.headers['x-forwarded-for'] },
    'Rate limit key info'
  )

  const file = req.file

  if (!file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ status: StatusCodes.BAD_REQUEST, error: 'No file sent.' })
  }

  let buffer: Buffer

  if (file.buffer) {
    buffer = file.buffer
  } else if (file.path) {
    buffer = await fs.readFile(file.path)
    await fs.unlink(file.path)
  } else {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: 'Unsupported file upload method.'
    })
  }

  let jobId: string | undefined

  try {
    const extractedText = await parseFileAndSanitize(buffer)
    const user = req.user as UserSchemaType | undefined
    const isPremium = isPremiumUser(user)

    jobId = randomUUID()

    await prisma.analysisJob.create({
      data: { id: jobId, userId: user?.id ?? null }
    })

    await analyzeQueue.add(
      'analyze',
      {
        extractedText,
        isPremium,
        userId: user?.id ?? null,
        fileName: file.originalname,
        fileSize: file.size,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      },
      { jobId }
    )

    return res.status(StatusCodes.ACCEPTED).json({ jobId })
  } catch (error) {
    logger.error({ error }, 'Error creating analysis job')

    if (jobId) {
      await prisma.analysisJob.delete({ where: { id: jobId } }).catch(() => {})
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Failed to enqueue analysis.'
    })
  }
}

export const getJobStatus = async (
  req: Request<{ jobId: string }>,
  res: Response
) => {
  const { jobId } = req.params

  const job = await prisma.analysisJob.findUnique({ where: { id: jobId } })

  if (!job) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: StatusCodes.NOT_FOUND, error: 'Job not found.' })
  }

  if (job.status === 'PENDING' || job.status === 'PROCESSING') {
    return res.status(StatusCodes.OK).json({ status: job.status })
  }

  if (job.status === 'FAILED') {
    return res
      .status(StatusCodes.OK)
      .json({ status: 'FAILED', error: job.error })
  }

  // COMPLETED — fetch result from Redis
  const resultJson = await redisClient.get(`result:${jobId}`)

  if (!resultJson) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      error: 'Result has expired. Use GET /analysis/:id to retrieve it.'
    })
  }

  await redisClient.del(`result:${jobId}`)

  const result = JSON.parse(resultJson) as AiAnalysis & {
    parsed_file: string
    user: { id: string } | null
  }

  return res.status(StatusCodes.OK).json({ status: 'COMPLETED', result })
}

// It's typed manually due to a lack of types from OpenAi
// Type structure is coming from: https://platform.openai.com/docs/api-reference/responses/input-items
type ParsedFile = {
  object: string
  data: [
    {
      id: string
      type: string
      role: string
      content: [
        {
          type: string
          text: string
        }
      ]
    }
  ]
  first_id: string
  last_id: string
  has_more: boolean
}

export const getAnalysis = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params

  const [user, response] = await Promise.all([
    getAnalysisOwner(id),
    openAiClient.responses
      .retrieve(id)
      .then((res) => ({ id: res.id, output_text: res.output_text }))
  ])

  const parsedResponse = parseOpenAiApiResponse(response)

  return res
    .status(StatusCodes.OK)
    .json({ status: StatusCodes.OK, ...parsedResponse, user })
}

export const getParsedFile = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params
  const requestingUser = req.user as UserSchemaType

  const [owner, responseList] = await Promise.all([
    getAnalysisOwner(id),
    openAiClient.responses.inputItems.list(id) as unknown as ParsedFile
  ])

  if (!owner || owner.id !== requestingUser.id) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: StatusCodes.FORBIDDEN,
      error: 'Access denied. You are not the owner of this analysis.'
    })
  }

  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    parsed_file: responseList.data[0].content[0].text
  })
}

export const cancelJob = async (
  req: Request<{ jobId: string }>,
  res: Response
) => {
  const { jobId } = req.params

  const bullJob = await analyzeQueue.getJob(jobId)
  if (bullJob) {
    const state = await bullJob.getState()
    if (state === 'waiting' || state === 'delayed' || state === 'prioritized') {
      await bullJob.remove().catch(() => {})
    }
  }

  await Promise.all([
    prisma.analysisJob
      .update({
        where: { id: jobId },
        data: { status: 'FAILED', error: 'Cancelled by user' }
      })
      .catch(() => {}),
    redisClient.del(`result:${jobId}`).catch(() => {})
  ])

  return res.status(StatusCodes.OK).json({ status: 'cancelled' })
}

export const getAnalysisHistory = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params
  const { limit, cursor } = req.query

  const pageSize = Math.max(Number(limit) || 10, 1)

  const result = await getAnalysisHistoryService(
    id,
    cursor as string | undefined,
    pageSize
  )

  return res.status(StatusCodes.OK).json(result)
}
