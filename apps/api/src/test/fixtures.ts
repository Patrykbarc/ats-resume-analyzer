import type { UserSchemaType } from '@monorepo/schemas'

export const baseUser: UserSchemaType = {
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
