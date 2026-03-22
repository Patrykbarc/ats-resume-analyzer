import { clearToken, setToken } from '@/api/tokenStorage'
import { refreshTokenService } from '@/services/authService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { useEffect, useRef, useState } from 'react'
import { useGetCurrentUser } from './useGetCurrentUser'

export const useAuth = () => {
  const hasAttemptedRefresh = useRef(false)
  const [hasRefreshed, setHasRefreshed] = useState(false)

  const {
    data,
    error,
    isSuccess,
    isFetched,
    isLoading: queryLoading
  } = useGetCurrentUser({ enabled: hasRefreshed })

  const {
    setUser,
    setIsUserLoggedIn,
    setIsLoading,
    setIsPremium,
    resetUserState
  } = useSessionStore()

  useEffect(() => {
    if (hasAttemptedRefresh.current) {
      return
    }
    hasAttemptedRefresh.current = true

    const refreshSession = async () => {
      try {
        const response = await refreshTokenService()
        setToken(response.data.token)
        setHasRefreshed(true)
      } catch {
        clearToken()
        resetUserState()
        setIsLoading(false)
      }
    }

    refreshSession()
  }, [resetUserState, setIsLoading])

  useEffect(() => {
    if (!hasRefreshed) {
      return
    }

    setIsLoading(queryLoading)

    if (isFetched) {
      if (isSuccess && data) {
        setUser({ ...data })
        setIsUserLoggedIn(true)
        setIsPremium(data.isPremium)
      } else {
        resetUserState()
      }
    }
  }, [
    isSuccess,
    isFetched,
    queryLoading,
    data,
    error,
    hasRefreshed,
    setUser,
    setIsUserLoggedIn,
    setIsPremium,
    setIsLoading,
    resetUserState
  ])
}
