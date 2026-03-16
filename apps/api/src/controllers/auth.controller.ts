import * as bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getEnvs } from '../lib/getEnv'
import { logger } from '../server'
import {
  sendPasswordResetEmail,
  sendRegisterConfirmationEmail
} from '../services/email.service'
import {
  clearRefreshToken,
  computeIsPremium,
  findUserBasicInfo,
  findUserByConfirmationToken,
  findUserByConfirmationTokenForResend,
  findUserByEmail,
  findUserByEmailForReset,
  findUserByIdAndRefreshToken,
  findUserByResetToken,
  findUserExtendedInfo,
  markEmailConfirmed,
  resetUserPassword,
  updateConfirmationToken,
  updateResetPasswordToken
} from '../services/auth.service'
import { createNewUser } from './helper/auth/createNewUser'
import { generateRegistrationToken } from './helper/auth/generateRegistrationToken'
import { getConfirmationTokenExpiry } from './helper/auth/getConfirmationTokenExpiry'
import { handleNewJwtTokens, jwtRefreshCookieOptions } from './helper/auth/handleNewJwtTokens'
import { verifyIsTokenExpired } from './helper/auth/verifyIsTokenExpired'

import { AuthErrorCodes } from '@monorepo/types'
import jwt from 'jsonwebtoken'

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await findUserByEmail(email)

  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: AuthErrorCodes.INVALID_CREDENTIALS
    })
  }

  if (!user.isEmailConfirmed) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: AuthErrorCodes.NOT_CONFIRMED
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: AuthErrorCodes.INVALID_CREDENTIALS })
  }

  const token = await handleNewJwtTokens({ res, userId: user.id })

  res.status(StatusCodes.OK).json({
    token
  })
}

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ message: 'User already exists.' })
  }

  const { confirmationToken } = await createNewUser({ email, password })

  try {
    await sendRegisterConfirmationEmail({
      reciever: email,
      confirmationToken
    })
  } catch (emailError) {
    logger.error(`Failed to send confirmation email: ${emailError}`)

    return res.status(StatusCodes.CREATED).json({
      message:
        'User created successfully but confirmation email failed to send. Please try resending.'
    })
  }

  res.status(StatusCodes.CREATED).json({
    message: 'User created successfully.'
  })
}

export const refreshToken = async (req: Request, res: Response) => {
  const { JWT_REFRESH_SECRET } = getEnvs()
  const refreshToken = req.cookies.jwt_refresh

  if (!refreshToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Refresh token missing.' })
  }

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
    userId: string
  }
  const userId = decoded.userId

  const user = await findUserByIdAndRefreshToken(userId, refreshToken)

  if (!user) {
    res.clearCookie('jwt_refresh', jwtRefreshCookieOptions(process.env.NODE_ENV === 'production'))
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: AuthErrorCodes.REFRESH_TOKEN_EXPIRED
    })
  }

  const newAccessToken = await handleNewJwtTokens({ userId, res })

  res.status(StatusCodes.OK).json({
    token: newAccessToken
  })
}

export const verifyUser = async (req: Request, res: Response) => {
  const { token } = req.body

  const userRecord = await findUserByConfirmationToken(token)

  if (!userRecord) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Verification token not found.' })
  }

  const isExpired = verifyIsTokenExpired(userRecord.confirmationTokenExpiry)

  if (isExpired) {
    return res
      .status(StatusCodes.GONE)
      .json({ message: 'Verification token has expired.' })
  }

  await markEmailConfirmed(userRecord.id)

  return res
    .status(StatusCodes.OK)
    .json({ message: 'Account successfully verified.' })
}

export const resendVerificationLink = async (req: Request, res: Response) => {
  const { token } = req.body

  const user = await findUserByConfirmationTokenForResend(token)

  if (!user) {
    return res.status(StatusCodes.OK).json({
      message: 'If the email exists, a new verification link has been sent.'
    })
  }

  if (user.isEmailConfirmed) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Email is already verified.'
    })
  }

  const confirmationToken = generateRegistrationToken()
  const confirmationTokenExpiry = getConfirmationTokenExpiry()

  await updateConfirmationToken(user.id, confirmationToken, confirmationTokenExpiry)

  await sendRegisterConfirmationEmail({
    reciever: user.email,
    confirmationToken
  })

  res.status(StatusCodes.OK).json({
    message: 'If the email exists, a new verification link has been sent.'
  })
}

export const logoutUser = async (req: Request, res: Response) => {
  const { JWT_REFRESH_SECRET } = getEnvs()
  const refreshToken = req.cookies.jwt_refresh

  if (!refreshToken) {
    return res.status(StatusCodes.OK).json({
      message: 'Already logged out.'
    })
  }

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
    userId: string
  }

  await clearRefreshToken(decoded.userId)

  res.clearCookie('jwt_refresh', jwtRefreshCookieOptions(process.env.NODE_ENV === 'production'))

  res.status(StatusCodes.OK).json({
    message: 'Logged out successfully.'
  })
}

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = (req.user as { id: string })?.id
  const extendQuery = req.query.extended === 'true'

  if (!userId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
  }

  const user = extendQuery
    ? await findUserExtendedInfo(userId)
    : await findUserBasicInfo(userId)

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'User not found'
    })
  }

  const { subscriptionCurrentPeriodEnd, ...userWithoutPeriodEnd } = user as typeof user & {
    subscriptionCurrentPeriodEnd?: Date | null
  }

  const isPremiumValue = computeIsPremium({
    isPremium: user.isPremium,
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd ?? null
  })

  res.status(StatusCodes.OK).json({
    ...userWithoutPeriodEnd,
    isPremium: isPremiumValue,
    ...(extendQuery && { subscriptionCurrentPeriodEnd })
  })
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body

  const user = await findUserByEmailForReset(email)

  if (!user) {
    return res.status(StatusCodes.OK).json({
      message: 'If the email exists, a password reset link has been sent.'
    })
  }

  const resetPasswordToken = generateRegistrationToken()
  const resetPasswordExpiry = getConfirmationTokenExpiry()

  await updateResetPasswordToken(user.id, resetPasswordToken, resetPasswordExpiry)

  await sendPasswordResetEmail({
    reciever: user.email,
    resetToken: resetPasswordToken
  })

  res.status(StatusCodes.OK).json({
    message: 'If the email exists, a password reset link has been sent.'
  })
}

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body

  const user = await findUserByResetToken(token)

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Invalid or expired reset token.'
    })
  }

  const isExpired = verifyIsTokenExpired(user.resetPasswordExpiry)

  if (isExpired) {
    return res.status(StatusCodes.GONE).json({
      message: 'Password reset token has expired.'
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await resetUserPassword(user.id, hashedPassword)

  res.status(StatusCodes.OK).json({
    message: 'Password has been reset successfully.'
  })
}
