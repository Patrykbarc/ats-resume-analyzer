import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseMutation = vi.hoisted(() =>
  vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
)

vi.mock('@tanstack/react-query', () => ({
  useMutation: mockUseMutation
}))

vi.mock('@/services/authService', () => ({
  deleteAccountService: vi.fn()
}))

import { deleteAccountService } from '@/services/authService'
import { useDeleteAccount } from './useDeleteAccount'

describe('useDeleteAccount', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls useMutation with deleteAccountService as mutationFn', () => {
    const options = { onSuccess: vi.fn() }
    useDeleteAccount(options as never)
    expect(mockUseMutation).toHaveBeenCalledWith({
      mutationFn: deleteAccountService,
      ...options
    })
  })

  it('returns the mutation object from useMutation', () => {
    const result = useDeleteAccount()
    expect(result.mutate).toBeDefined()
    expect(result.isPending).toBe(false)
  })
})
