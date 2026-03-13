import { UserSchemaType } from '@monorepo/schemas'
import { AuthErrorCodes } from '@monorepo/types'
import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import passport from '../config/passport.config'
import { logger } from '../server'

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error, user: UserSchemaType, info?: { name?: string }) => {
      if (err) {
        logger.fatal(err)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Authentication error'
        })
      }

      if (!user) {
        if (info?.name === 'TokenExpiredError') {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: AuthErrorCodes.ACCESS_TOKEN_EXPIRED
          })
        }
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'Unauthorized' })
      }

      req.user = user
      next()
    }
  )(req, res, next)
}
