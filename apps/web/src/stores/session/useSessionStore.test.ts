import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/tokenStorage', () => ({
  setToken: vi.fn(),
  clearToken: vi.fn(),
  getToken: vi.fn(() => null)
}))

import { clearToken, setToken } from '@/api/tokenStorage'
import type { CurrentUser } from '@/hooks/useGetCurrentUser'
import { useSessionStore } from './useSessionStore'

const mockUser: CurrentUser = {
  id: '1',
  email: 'test@test.com',
  isPremium: false
}

describe('useSessionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSessionStore.setState({
      user: null,
      authToken: null,
      isUserLoggedIn: false,
      isPremium: false,
      isLoading: true
    })
  })

  it('sets user correctly', () => {
    useSessionStore.getState().setUser(mockUser)
    expect(useSessionStore.getState().user).toEqual(mockUser)
  })

  it('sets auth token, calls setToken, and updates state', () => {
    useSessionStore.getState().setAuthToken('test-token')
    expect(setToken).toHaveBeenCalledWith('test-token')
    expect(useSessionStore.getState().authToken).toBe('test-token')
  })

  it('clears auth token when null is passed and calls clearToken', () => {
    useSessionStore.getState().setAuthToken('test-token')
    vi.clearAllMocks()
    useSessionStore.getState().setAuthToken(null)
    expect(clearToken).toHaveBeenCalled()
    expect(useSessionStore.getState().authToken).toBeNull()
  })

  it('sets isUserLoggedIn correctly', () => {
    useSessionStore.getState().setIsUserLoggedIn(true)
    expect(useSessionStore.getState().isUserLoggedIn).toBe(true)
  })

  it('sets isPremium correctly', () => {
    useSessionStore.getState().setIsPremium(true)
    expect(useSessionStore.getState().isPremium).toBe(true)
  })

  it('resetUserState clears user, isUserLoggedIn, and isPremium', () => {
    useSessionStore.setState({
      user: mockUser,
      isUserLoggedIn: true,
      isPremium: true
    })

    useSessionStore.getState().resetUserState()

    const state = useSessionStore.getState()
    expect(state.user).toBeNull()
    expect(state.isUserLoggedIn).toBe(false)
    expect(state.isPremium).toBe(false)
  })

  it('resetUserState calls clearToken', () => {
    useSessionStore.getState().resetUserState()
    expect(clearToken).toHaveBeenCalled()
  })
})
