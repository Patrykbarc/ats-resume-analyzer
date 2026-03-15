import { prisma } from '../server'

export const findUserWithSubscription = async (id: string) =>
  prisma.user.findUnique({ where: { id } })

export const updateSubscriptionCancellation = async (
  id: string,
  currentPeriodEnd: Date | null
) =>
  prisma.user.update({
    where: { id },
    data: {
      cancelAtPeriodEnd: true,
      subscriptionCurrentPeriodEnd: currentPeriodEnd
    }
  })

export const updateSubscriptionRestored = async (id: string, status: string) =>
  prisma.user.update({
    where: { id },
    data: {
      subscriptionStatus: status as Parameters<
        typeof prisma.user.update
      >[0]['data']['subscriptionStatus'],
      cancelAtPeriodEnd: false
    }
  })
