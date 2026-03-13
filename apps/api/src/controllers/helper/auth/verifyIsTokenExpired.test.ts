import { describe, expect, it } from 'vitest'
import { verifyIsTokenExpired } from './verifyIsTokenExpired'

describe('verifyIsTokenExpired', () => {
  it('returns true when expiryDate is null', () => {
    expect(verifyIsTokenExpired(null)).toBe(true)
  })

  it('returns true when expiryDate is in the past', () => {
    const pastDate = new Date(Date.now() - 10_000)
    expect(verifyIsTokenExpired(pastDate)).toBe(true)
  })

  it('returns false when expiryDate is in the future', () => {
    const futureDate = new Date(Date.now() + 10_000)
    expect(verifyIsTokenExpired(futureDate)).toBe(false)
  })
})
