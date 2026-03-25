import { HEADERS } from '@monorepo/constants'
import { AxiosError, AxiosResponse, isAxiosError } from 'axios'
import { StatusCodes } from 'http-status-codes'

const isRateLimitError = (error: unknown): error is AxiosError => {
  return (
    isAxiosError(error) &&
    error.response?.status === StatusCodes.TOO_MANY_REQUESTS
  )
}

const getHeadersRateLimitRemaining = (
  response?: AxiosResponse
): number | null => {
  const remaining = response?.headers?.[HEADERS['X-RateLimit-Remaining']]
  if (remaining == null) {
    return null
  }

  const parsed = Number(remaining)
  return isNaN(parsed) ? null : parsed
}

const getHeadersRateLimitReset = (response?: AxiosResponse): string | null => {
  const resetTimestamp = response?.headers?.[HEADERS['X-RateLimit-Reset']]
  if (!resetTimestamp) {
    return null
  }

  return String(resetTimestamp)
}

export {
  getHeadersRateLimitRemaining,
  getHeadersRateLimitReset,
  isRateLimitError
}
