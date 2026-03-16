import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getEnvs } from '../lib/getEnv'

export const requireCronKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { CRON_SECRET_KEY } = getEnvs()
  const cronKey = req.headers['x-cron-key'] as string | undefined

  if (cronKey !== CRON_SECRET_KEY) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
  }

  next()
}
