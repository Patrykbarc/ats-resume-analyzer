import { apiClient } from '@/api/apiClient'
import { CurrentUser } from '@/hooks/useGetCurrentUser'
import {
  LoginUserSchemaType,
  RegisterUserSchemaType,
  ResendEmailValidationSchemaType,
  ResetPasswordSchemaType,
  UserSchemaType,
  VerifyUserSchemaType
} from '@monorepo/schemas'
import { AuthType, VerifyUserApiResponse } from '@monorepo/types'
import { isAxiosError } from 'axios'
import { StatusCodes } from 'http-status-codes'

export const loginService = async (value: LoginUserSchemaType) => {
  const response = await apiClient.post<AuthType>('/auth/login', {
    ...value
  })

  localStorage.setItem('jwtToken', response.data.token)

  return response
}

export const registerService = async (value: RegisterUserSchemaType) => {
  const response = await apiClient.post<AuthType>('/auth/register', {
    ...value
  })

  return response
}

export const logoutService = async () => {
  return await apiClient.post('/auth/logout')
}

export const verifyUserService = async (token: VerifyUserSchemaType) => {
  try {
    await apiClient.post<VerifyUserApiResponse>('/auth/verify', { ...token })

    return { status: StatusCodes.OK }
  } catch (error) {
    if (!isAxiosError(error)) {
      return { status: StatusCodes.INTERNAL_SERVER_ERROR }
    }

    if (error.response) {
      return {
        status: error.response.status
      }
    }

    return { status: StatusCodes.INTERNAL_SERVER_ERROR }
  }
}

export const resendVerificationLink = async (token: VerifyUserSchemaType) => {
  const response = await apiClient.post<VerifyUserApiResponse>(
    '/auth/verify/resend',
    { ...token }
  )

  return response.data
}

export const getCurrentUserService = async () => {
  try {
    const response = await apiClient<CurrentUser>('/auth/me')

    return response.data
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === StatusCodes.UNAUTHORIZED
    ) {
      return null
    }
    throw error
  }
}

type CurrentUserDetails = CurrentUser &
  Pick<
    UserSchemaType,
    | 'createdAt'
    | 'subscriptionStatus'
    | 'subscriptionCurrentPeriodEnd'
    | 'cancelAtPeriodEnd'
  >

export const getUserAccountInformationsService = async () => {
  const response = await apiClient<CurrentUserDetails | null>('/auth/me', {
    params: { extended: true }
  })

  return response.data
}

export const requestPasswordReset = async (
  email: ResendEmailValidationSchemaType['email']
) => {
  await apiClient.post('/auth/password/request-reset', { email })
}

export const resetPassword = async (data: ResetPasswordSchemaType) => {
  await apiClient.post('/auth/password/reset', data)
}
