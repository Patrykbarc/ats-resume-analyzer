import type { UserSchemaType } from '@monorepo/schemas'
import { describe, expect, it } from 'vitest'
import { isPremiumUser } from './isPremiumUser'

const baseUser: UserSchemaType = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@test.com',
  createdAt: new Date(),
  isPremium: false,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: null,
  subscriptionStartedAt: null,
  subscriptionCurrentPeriodEnd: null,
  cancelAtPeriodEnd: false
}

describe('isPremiumUser', () => {
  it('returns false when user is undefined', () => {
    expect(isPremiumUser(undefined)).toBe(false)
  })

  it('returns false when isPremium is false', () => {
    const user = {
      ...baseUser,
      isPremium: false,
      subscriptionCurrentPeriodEnd: new Date(Date.now() + 1_000_000)
    }
    expect(isPremiumUser(user)).toBe(false)
  })

  it('returns false when subscriptionCurrentPeriodEnd is null', () => {
    const user = {
      ...baseUser,
      isPremium: true,
      subscriptionCurrentPeriodEnd: null
    }
    expect(isPremiumUser(user)).toBe(false)
  })

  it('returns false when subscription has expired', () => {
    const user = {
      ...baseUser,
      isPremium: true,
      subscriptionCurrentPeriodEnd: new Date(Date.now() - 1_000_000)
    }
    expect(isPremiumUser(user)).toBe(false)
  })

  it('returns true when isPremium is true and subscription is active', () => {
    const user = {
      ...baseUser,
      isPremium: true,
      subscriptionCurrentPeriodEnd: new Date(Date.now() + 1_000_000)
    }
    expect(isPremiumUser(user)).toBe(true)
  })
})
