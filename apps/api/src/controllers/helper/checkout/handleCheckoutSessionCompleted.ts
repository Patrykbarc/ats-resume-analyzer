import Stripe from 'stripe'
import { getEnvs } from '../../../lib/getEnv'
import { logger, prisma } from '../../../server'

const { STRIPE_SECRET_KEY } = getEnvs()

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  typescript: true
})

export const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  if (!session.metadata?.userId) {
    logger.error(
      `Missing userId in session metadata. Metadata: ${JSON.stringify(session.metadata)}`
    )
    return { status: 400, message: 'Bad Request: Missing userId in metadata' }
  }

  const userId = session.metadata.userId
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id

  if (!subscriptionId) {
    logger.error('Missing subscription ID in checkout session')
    return { status: 400, message: 'Bad Request: Missing subscription ID' }
  }

  logger.info(`Retrieving subscription ${subscriptionId} from Stripe`)

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end
  const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null

  const now = new Date()

  logger.info('Updating user subscription status in the database')

  const updatedUser = await prisma.user.update({
    data: {
      isPremium: true,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      subscriptionCurrentPeriodEnd: periodEnd,
      subscriptionStartedAt: now,
      subscriptionStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false
    },
    where: { id: userId }
  })

  if (!updatedUser) {
    logger.error(`User with ID ${userId} was not found.`)
    return { status: 404, message: 'User not found' }
  }

  logger.info(`Payment completed for user ${userId}`)
  return null
}
