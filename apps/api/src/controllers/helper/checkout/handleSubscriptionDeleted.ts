import Stripe from 'stripe'
import { logger, prisma } from '../../../server'

export const handleSubscriptionDeleted = async (
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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPremium: false,
      subscriptionStatus: 'canceled',
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null
    }
  })

  logger.info(
    `Subscription ${subscriptionId} deleted for user ${user.id}. Premium access revoked.`
  )
}
