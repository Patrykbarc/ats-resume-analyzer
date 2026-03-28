import { FREE_REQUESTS_PER_DAY, HEADERS } from '@monorepo/constants'
import type { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../server'

const DAY_MS = 24 * 60 * 60 * 1000
const THIRTY_SECONDS_IN_MS = 30 * 1000
const MAX_REQUESTS = FREE_REQUESTS_PER_DAY

function setRateLimitHeaders(res: Response, remaining: number, resetAt: Date) {
  res.setHeader(HEADERS['X-RateLimit-Limit'], MAX_REQUESTS)
  res.setHeader(HEADERS['X-RateLimit-Remaining'], Math.max(0, remaining))
  res.setHeader(
    HEADERS['X-RateLimit-Reset'],
    Math.floor(resetAt.getTime() / 1000)
  )
}

async function checkAndIncrement(key: string) {
  const now = new Date()

  return prisma.$transaction(async (tx) => {
    const entry = await tx.rateLimit.findUnique({ where: { key } })

    if (!entry || entry.resetAt <= now) {
      const resetAt = new Date(now.getTime() + DAY_MS)
      await tx.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt }
      })
      return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt }
    }

    if (entry.count >= MAX_REQUESTS) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    const updated = await tx.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } }
    })
    return {
      allowed: true,
      remaining: MAX_REQUESTS - updated.count,
      resetAt: entry.resetAt
    }
  })
}

const makeAnalyzeLimiter =
  (getKey: (req: Request) => string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = getKey(req)
      const result = await checkAndIncrement(key)
      setRateLimitHeaders(res, result.remaining, result.resetAt)
      if (!result.allowed) {
        return void res
          .status(StatusCodes.TOO_MANY_REQUESTS)
          .json({ error: 'The limit of analyses has been reached.' })
      }
      next()
    } catch (err) {
      next(err)
    }
  }

export const analyzeLimiter = makeAnalyzeLimiter(
  (req) => `free:${req.ip ?? 'unknown'}`
)

export const userAnalyzeLimiter = makeAnalyzeLimiter((req) => {
  const user = req.user as { id?: string } | undefined
  return `user:${user?.id ?? req.ip ?? 'unknown'}`
})

export const authAttemptLimiter = rateLimit({
  windowMs: THIRTY_SECONDS_IN_MS,
  limit: 5,
  message: { error: 'Too many attempts, please try again later.' },
  validate: { trustProxy: true }
})
