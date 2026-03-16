import { sentryLogger } from '@monorepo/sentry-logger'
import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import OpenAI from 'openai'
import { logger } from '../server'

const EXPECTED_STATUSES = [
  StatusCodes.NOT_FOUND,
  StatusCodes.BAD_REQUEST,
  StatusCodes.UNAUTHORIZED,
  StatusCodes.FORBIDDEN,
  StatusCodes.TOO_MANY_REQUESTS
]

interface AppError extends Error {
  status?: number
}

export const middlewareErrorHandler = (
  err: AppError,
  _: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`An error occured: ${err}`)

  if (err instanceof OpenAI.APIError) {
    const { status, message } = err

    logger.error(message)

    const statusCode = status || StatusCodes.INTERNAL_SERVER_ERROR

    if (EXPECTED_STATUSES.includes(status)) {
      sentryLogger.expected(err, { context: 'OpenAI API error', status })
    } else {
      sentryLogger.unexpected(err, { context: 'OpenAI API error', status })
    }

    switch (status) {
      case StatusCodes.NOT_FOUND:
        return res.status(statusCode).json({
          status: statusCode,
          error: 'The requested resource was not found.'
        })
      case StatusCodes.BAD_REQUEST:
        return res.status(statusCode).json({
          status: statusCode,
          error: 'Bad Request.'
        })
      case StatusCodes.UNAUTHORIZED:
      case StatusCodes.FORBIDDEN:
        return res.status(statusCode).json({
          status: statusCode,
          error: 'Authentication issue or forbidden access.'
        })
      case StatusCodes.TOO_MANY_REQUESTS:
        return res.status(statusCode).json({
          status: statusCode,
          error: 'Rate Limit exceeded. Please try again later.'
        })
      default:
        return res.status(statusCode).json({
          status: statusCode,
          error: 'An unexpected error occurred.'
        })
    }
  }

  sentryLogger.unexpected(err, { context: 'middlewareErrorHandler fallthrough' })

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    error: 'Internal server error. Could not connect or application logic error.'
  })
}
