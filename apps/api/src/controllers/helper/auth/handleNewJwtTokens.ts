import type { Response } from 'express'
import jwt from 'jsonwebtoken'
import { getEnvs } from '../../../lib/getEnv'
import { prisma } from '../../../server'

export const jwtRefreshCookieOptions = (isProduction: boolean) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax'
})

export const handleNewJwtTokens = async ({
  userId,
  res
}: {
  userId: string
  res: Response
}) => {
  const { JWT_SECRET, JWT_REFRESH_SECRET } = getEnvs()

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '1h'
  })

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  })

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken }
  })

  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie('jwt_refresh', refreshToken, {
    ...jwtRefreshCookieOptions(isProduction),
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return token
}
