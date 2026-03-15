import { prisma } from '../server'

export const findUserByEmail = async (email: string) =>
  prisma.user.findUnique({ where: { email } })

export const findUserByIdAndRefreshToken = async (id: string, token: string) =>
  prisma.user.findUnique({ where: { id, refreshToken: token } })

export const findUserByConfirmationToken = async (token: string) =>
  prisma.user.findUnique({
    where: { confirmationToken: token },
    select: { id: true, confirmationTokenExpiry: true }
  })

export const findUserByConfirmationTokenForResend = async (token: string) =>
  prisma.user.findUnique({
    where: { confirmationToken: token },
    select: { id: true, email: true, isEmailConfirmed: true }
  })

export const findUserBasicInfo = async (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      isPremium: true,
      subscriptionCurrentPeriodEnd: true
    }
  })

export const findUserExtendedInfo = async (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      isPremium: true,
      subscriptionCurrentPeriodEnd: true,
      createdAt: true,
      subscriptionStatus: true,
      cancelAtPeriodEnd: true
    }
  })

export const findUserByEmailForReset = async (email: string) =>
  prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true }
  })

export const findUserByResetToken = async (token: string) =>
  prisma.user.findUnique({
    where: { resetPasswordToken: token },
    select: { id: true, resetPasswordExpiry: true }
  })

export const markEmailConfirmed = async (id: string) =>
  prisma.user.update({
    where: { id },
    data: {
      confirmationToken: null,
      confirmationTokenExpiry: null,
      isEmailConfirmed: true
    }
  })

export const updateConfirmationToken = async (
  id: string,
  token: string,
  expiry: Date
) =>
  prisma.user.update({
    where: { id },
    data: { confirmationToken: token, confirmationTokenExpiry: expiry }
  })

export const updateResetPasswordToken = async (
  id: string,
  token: string,
  expiry: Date
) =>
  prisma.user.update({
    where: { id },
    data: { resetPasswordToken: token, resetPasswordExpiry: expiry }
  })

export const resetUserPassword = async (id: string, hashedPassword: string) =>
  prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null
    }
  })

export const clearRefreshToken = async (id: string) =>
  prisma.user.update({
    where: { id },
    data: { refreshToken: null }
  })

export const computeIsPremium = (user: {
  isPremium: boolean
  subscriptionCurrentPeriodEnd: Date | null
}) =>
  user.isPremium &&
  user.subscriptionCurrentPeriodEnd != null &&
  user.subscriptionCurrentPeriodEnd > new Date()
