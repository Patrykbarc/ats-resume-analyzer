import { clearToken, setToken } from '@/api/tokenStorage'
import { CurrentUser } from '@/hooks/useGetCurrentUser'
import { create, StoreApi, UseBoundStore } from 'zustand'

export type SessionState = {
  user: CurrentUser | null
  setUser: (user: CurrentUser | null) => void
  authToken: string | null
  setAuthToken: (token: string | null) => void
  isUserLoggedIn: boolean
  setIsUserLoggedIn: (loggedIn: boolean) => void
  isPremium: boolean
  setIsPremium: (premium: boolean) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  resetUserState: () => void
}

export type SessionStoreReturnType = UseBoundStore<StoreApi<SessionState>>

const state = {
  user: null,
  authToken: null,
  isUserLoggedIn: false,
  isPremium: false,
  isLoading: true
} as const

export const useSessionStore = create(
  (set): SessionState => ({
    ...state,

    setUser: (user) => set({ user }),
    setAuthToken: (token) => {
      if (token) {
        setToken(token)
      } else {
        clearToken()
      }
      set({ authToken: token, user: null })
    },
    setIsUserLoggedIn: (loggedIn) => set({ isUserLoggedIn: loggedIn }),
    setIsPremium: (premium) => set({ isPremium: premium }),
    setIsLoading: (loading) => set({ isLoading: loading }),

    resetUserState: () => {
      clearToken()
      set({
        user: null,
        authToken: null,
        isUserLoggedIn: false,
        isPremium: false
      })
    }
  })
)
