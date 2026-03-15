import { UserSchemaType } from '@monorepo/schemas'
import type { Request } from 'express'
import { logger, prisma } from '../server'

export const getAnalysisOwner = async (analyseId: string) => {
  return prisma.user.findFirst({
    select: { id: true },
    where: {
      requestLogs: {
        some: { analyseId }
      }
    }
  })
}

export const getAnalysisHistory = async (
  userId: string,
  cursor?: string,
  limit = 10
) => {
  const pageSize = Math.max(limit, 1)

  const results = await prisma.requestLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: pageSize + 1,
    ...(cursor ? { cursor: { analyseId: cursor }, skip: 1 } : {}),
    select: { analyseId: true, createdAt: true, fileName: true, fileSize: true }
  })

  const hasMore = results.length > pageSize
  if (hasMore) {
    results.pop()
  }

  const nextCursor = hasMore
    ? (results[results.length - 1]?.analyseId ?? null)
    : null

  return {
    logs: results,
    pagination: { nextCursor, hasMore, pageSize }
  }
}

export const saveRequestLog = async ({
  user,
  resultId,
  file,
  req
}: {
  user: UserSchemaType
  resultId: string
  file: Express.Multer.File
  req: Request
}) => {
  try {
    const fileName = (file.originalname = Buffer.from(
      file.originalname,
      'latin1'
    ).toString('utf8'))

    await prisma.user.update({
      where: { id: user.id },
      data: {
        requestLogs: {
          create: {
            analyseId: resultId,
            fileName,
            fileSize: file.size,
            isPremiumRequest: user.isPremium,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || null
          }
        }
      }
    })
  } catch (error) {
    logger.error(`Error saving request log: ${error}`)
  }
}
