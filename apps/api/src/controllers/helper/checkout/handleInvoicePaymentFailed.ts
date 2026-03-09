import Stripe from 'stripe'
import { logger, prisma } from '../../../server'

export const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  const subscription = (
    invoice as unknown as { subscription?: string | Stripe.Subscription }
  ).subscription
  const subscriptionId =
    typeof subscription === 'string' ? subscription : subscription?.id

  if (!subscriptionId) {
    logger.warn('invoice.payment_failed: no subscription ID found')
    return
  }

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
      subscriptionStatus: 'past_due'
    }
  })

  logger.info(
    `Payment failed for subscription ${subscriptionId}, user ${user.id}. Status set to past_due.`
  )
}
