import { UserSchemaType } from '@monorepo/schemas'
import type { AiAnalysis, AiAnalysisError } from '@monorepo/types'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { promises as fs } from 'node:fs'
import {
  analyzeStore,
  ipKeyGenerator,
  userAnalyzeStore
} from '../config/limiter.config'
import { logger, openAiClient, prisma } from '../server'
import { analyzeFile } from './helper/analyze/analyzeFile'
import { isPremiumUser } from './helper/analyze/isPremiumUser'
import { parseFileAndSanitize } from './helper/analyze/parseFileAndSanitize'
import { parseOpenAiApiResponse } from './helper/analyze/parseOpenAiApiResponse'
import { saveRequestLog } from './helper/analyze/saveRequestLog'
import { handleError } from './helper/handleError'

export const createAnalyze = async (req: Request, res: Response) => {
  const file = req.file

  if (!file) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ status: StatusCodes.BAD_REQUEST, error: 'No file sent.' })
  }

  try {
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

    const sanitizedTextResult = await parseFileAndSanitize(buffer)

    const user = req.user as UserSchemaType | undefined

    const signal = (req as Request & { signal?: AbortSignal }).signal

    const analysisResult: AiAnalysis | AiAnalysisError = await analyzeFile(
      sanitizedTextResult,
      { premium: isPremiumUser(user), signal }
    )

    if ('error' in analysisResult) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        ...analysisResult
      })
    }

    if (user?.id) {
      await saveRequestLog({ user, resultId: analysisResult.id, req, file })
    } else {
      logger.warn(
        'Unable to save request log: No user information available in request.'
      )
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      ...(analysisResult as AiAnalysis),
      parsed_file: sanitizedTextResult
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const key =
        (req.user as { id?: string } | undefined)?.id ??
        ipKeyGenerator(req.ip ?? 'unknown')

      const store = req.user ? userAnalyzeStore : analyzeStore
      await store.decrement(key)

      if (!res.headersSent) {
        res.status(499).end()
      }
      return
    }
    handleError(error, res)
  }
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

  try {
    const [user, response] = await Promise.all([
      prisma.user.findFirst({
        select: {
          id: true
        },
        where: {
          requestLogs: {
            some: {
              analyseId: id
            }
          }
        }
      }),
      openAiClient.responses
        .retrieve(id)
        .then((res) => ({ id: res.id, output_text: res.output_text }))
    ])

    const parsedResponse = parseOpenAiApiResponse(response)

    return res
      .status(StatusCodes.OK)
      .json({ status: StatusCodes.OK, ...parsedResponse, user })
  } catch (error) {
    handleError(error, res)
  }
}

export const getParsedFile = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params
  const requestingUser = req.user as UserSchemaType

  try {
    const [owner, responseList] = await Promise.all([
      prisma.user.findFirst({
        select: { id: true },
        where: { requestLogs: { some: { analyseId: id } } }
      }),
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
  } catch (error) {
    handleError(error, res)
  }
}

export const getAnalysisHistory = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params
  const { limit, page } = req.query

  const currentPage = Math.max(Number(page) || 1, 1)
  const pageSize = Math.max(Number(limit) || 10, 1)

  try {
    const [logs, totalCount] = await Promise.all([
      prisma.requestLog.findMany({
        select: {
          analyseId: true,
          createdAt: true,
          fileName: true,
          fileSize: true
        },
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (currentPage - 1) * pageSize
      }),
      prisma.requestLog.count({ where: { userId: id } })
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return res.status(StatusCodes.OK).json({
      logs,
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        pageSize
      }
    })
  } catch (error) {
    handleError(error, res)
  }
}
