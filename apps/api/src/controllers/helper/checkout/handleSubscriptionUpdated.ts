import Stripe from 'stripe'
import { logger, prisma } from '../../../server'

export const handleSubscriptionUpdated = async (
  subscription: Stripe.Subscription
) => {
  const subscriptionId = subscription.id

  const user = await prisma.user.findUnique({
    where: { stripeSubscriptionId: subscriptionId }
  })

  if (!user) {
    logger.warn(`No user found for subscription ${subscriptionId}`)
    return
  }

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null

  const isPremium = ['active', 'trialing'].includes(subscription.status)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPremium,
      subscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false
    }
  })

  logger.info(
    `Subscription ${subscriptionId} updated for user ${user.id}: status=${subscription.status}, cancelAtPeriodEnd=${subscription.cancel_at_period_end}`
  )
}
