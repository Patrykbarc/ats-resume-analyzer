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
  const remaining = response?.headers?.['x-ratelimit-remaining']
  if (remaining == null) {
    return null
  }

  const parsed = Number(remaining)
  return isNaN(parsed) ? null : parsed
}

const getHeadersRateLimitReset = (response?: AxiosResponse): string | null => {
  const resetTimestamp = response?.headers?.['x-ratelimit-reset']
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
