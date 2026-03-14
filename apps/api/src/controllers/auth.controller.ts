import * as bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { getEnvs } from '../lib/getEnv'
import { logger, prisma } from '../server'
import {
  sendPasswordResetEmail,
  sendRegisterConfirmationEmail
} from '../services/email.service'
import { createNewUser } from './helper/auth/createNewUser'
import { generateRegistrationToken } from './helper/auth/generateRegistrationToken'
import { getConfirmationTokenExpiry } from './helper/auth/getConfirmationTokenExpiry'
import { handleNewJwtTokens } from './helper/auth/handleNewJwtTokens'
import { verifyIsTokenExpired } from './helper/auth/verifyIsTokenExpired'
import { handleError } from './helper/handleError'

import { AuthErrorCodes } from '@monorepo/types'
import jwt from 'jsonwebtoken'

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

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
  } catch (error) {
    handleError(error, res)
  }
}

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })

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
  } catch (error) {
    handleError(error, res)
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const { JWT_REFRESH_SECRET } = getEnvs()
  const refreshToken = req.cookies.jwt_refresh

  if (!refreshToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Refresh token missing.' })
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string
    }
    const userId = decoded.userId

    const user = await prisma.user.findUnique({
      where: { id: userId, refreshToken: refreshToken }
    })

    if (!user) {
      res.clearCookie('jwt_refresh')
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: AuthErrorCodes.REFRESH_TOKEN_EXPIRED
      })
    }

    const newAccessToken = await handleNewJwtTokens({ userId, res })

    res.status(StatusCodes.OK).json({
      token: newAccessToken
    })
  } catch (error) {
    handleError(error, res)

    res.clearCookie('jwt_refresh')
    return res.status(StatusCodes.FORBIDDEN).json({
      message: AuthErrorCodes.REFRESH_TOKEN_EXPIRED
    })
  }
}

export const verifyUser = async (req: Request, res: Response) => {
  const { token } = req.body

  try {
    const userRecord = await prisma.user.findUnique({
      where: {
        confirmationToken: token
      },
      select: {
        id: true,
        confirmationTokenExpiry: true
      }
    })

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

    await prisma.user.update({
      where: {
        id: userRecord.id
      },
      data: {
        confirmationToken: null,
        confirmationTokenExpiry: null,
        isEmailConfirmed: true
      }
    })

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Account successfully verified.' })
  } catch (error) {
    handleError(error, res)
  }
}

export const resendVerificationLink = async (req: Request, res: Response) => {
  const { token } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { confirmationToken: token },
      select: { id: true, email: true, isEmailConfirmed: true }
    })

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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        confirmationToken,
        confirmationTokenExpiry
      }
    })

    await sendRegisterConfirmationEmail({
      reciever: user.email,
      confirmationToken
    })

    res.status(StatusCodes.OK).json({
      message: 'If the email exists, a new verification link has been sent.'
    })
  } catch (error) {
    handleError(error, res)
  }
}

export const logoutUser = async (req: Request, res: Response) => {
  const { JWT_REFRESH_SECRET } = getEnvs()
  const refreshToken = req.cookies.jwt_refresh

  if (!refreshToken) {
    return res.status(StatusCodes.OK).json({
      message: 'Already logged out.'
    })
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { refreshToken: null }
    })

    res.clearCookie('jwt_refresh')

    res.status(StatusCodes.OK).json({
      message: 'Logged out successfully.'
    })
  } catch (error) {
    handleError(error, res)
    res.clearCookie('jwt_refresh')
    res.status(StatusCodes.OK).json({
      message: 'Logged out successfully.'
    })
  }
}

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string })?.id
    const extendQuery = req.query.extended === 'true'

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Unauthorized'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isPremium: true,
        subscriptionCurrentPeriodEnd: true,

        ...(extendQuery && {
          createdAt: true,
          subscriptionStatus: true,
          cancelAtPeriodEnd: true
        })
      }
    })

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'User not found'
      })
    }

    const computedIsPremium =
      user.isPremium &&
      user.subscriptionCurrentPeriodEnd != null &&
      user.subscriptionCurrentPeriodEnd > new Date()

    const { subscriptionCurrentPeriodEnd, ...userWithoutPeriodEnd } = user

    res.status(StatusCodes.OK).json({
      ...userWithoutPeriodEnd,
      isPremium: computedIsPremium,
      ...(extendQuery && { subscriptionCurrentPeriodEnd })
    })
  } catch (error) {
    handleError(error, res)
  }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    })

    if (!user) {
      return res.status(StatusCodes.OK).json({
        message: 'If the email exists, a password reset link has been sent.'
      })
    }

    const resetPasswordToken = generateRegistrationToken()
    const resetPasswordExpiry = getConfirmationTokenExpiry()

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpiry
      }
    })

    await sendPasswordResetEmail({
      reciever: user.email,
      resetToken: resetPasswordToken
    })

    res.status(StatusCodes.OK).json({
      message: 'If the email exists, a password reset link has been sent.'
    })
  } catch (error) {
    handleError(error, res)
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { resetPasswordToken: token },
      select: { id: true, resetPasswordExpiry: true }
    })

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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    })

    res.status(StatusCodes.OK).json({
      message: 'Password has been reset successfully.'
    })
  } catch (error) {
    handleError(error, res)
  }
}
