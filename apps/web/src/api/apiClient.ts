import { clearToken, getToken, setToken } from '@/api/tokenStorage'
import { getEnvs } from '@/lib/getEnv'
import { AuthErrorCodes } from '@monorepo/types'
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  isAxiosError
} from 'axios'
import { StatusCodes } from 'http-status-codes'

export const apiClient = axios.create({
  baseURL: `${getEnvs().VITE_API_URL}/api`,
  timeout: 120_000,
  withCredentials: true
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason: unknown) => void
}> = []

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()

    if (token) {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    const { response } = error
    const errorCode = (response?.data as { message?: string })?.message

    const isStatusCodeUnauthorizedOrForbidden =
      response?.status === StatusCodes.UNAUTHORIZED ||
      response?.status === StatusCodes.FORBIDDEN

    const isAccessTokenExpired =
      errorCode === AuthErrorCodes.ACCESS_TOKEN_EXPIRED

    const shouldRefreshToken =
      isStatusCodeUnauthorizedOrForbidden &&
      isAccessTokenExpired &&
      !originalRequest._retry

    if (shouldRefreshToken) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(apiClient(originalRequest)),
            reject
          })
        })
      }

      isRefreshing = true

      try {
        const refreshResponse = await apiClient.post('/auth/refresh')
        const newAccessToken = refreshResponse.data.token

        setToken(newAccessToken)

        isRefreshing = false
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError: unknown) {
        isRefreshing = false
        clearToken()

        if (isAxiosError(refreshError)) {
          processQueue(refreshError)
        } else {
          processQueue(null)
        }

        window.location.href = '/login'

        return Promise.reject(refreshError || error)
      }
    }

    return Promise.reject(error)
  }
)
