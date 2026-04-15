import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Stripe from 'stripe'
import { getEnvs } from '../lib/getEnv'
import { isStripeError } from '../lib/isStripeError'
import { logger } from '../server'
import {
  findUserWithSubscription,
  updateSubscriptionCancellation,
  updateSubscriptionRestored
} from '../services/checkout.service'
import { handleCheckoutSessionCompleted } from './helper/checkout/handleCheckoutSessionCompleted'
import { handleInvoicePaymentFailed } from './helper/checkout/handleInvoicePaymentFailed'
import { handleSubscriptionDeleted } from './helper/checkout/handleSubscriptionDeleted'
import { handleSubscriptionUpdated } from './helper/checkout/handleSubscriptionUpdated'

const {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  FRONTEND_URL,
  STRIPE_PRICE_ID
} = getEnvs()

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  typescript: true
})

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { id } = req.body

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${FRONTEND_URL}/checkout/success?id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/checkout/cancel?id={CHECKOUT_SESSION_ID}`,
    metadata: { userId: id }
  })

  const { url } = session

  res.status(StatusCodes.OK).json({ url })
}

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET)
    logger.info(`Received event: ${event.type}`)
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err}`)
    return res.status(400).send(`Webhook Error`)
  }
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const result = await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        if (result) {
          return res.status(result.status).send(result.message)
        }
        break
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }
    }
  } catch (error) {
    logger.error(`Error processing webhook event ${event.type}: ${error}`)
    return res.status(500).send('Internal Server Error')
  }

  res.status(200).send('Webhook received')
}

export const verifyPaymentSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.query
    logger.info(`Verifying session ID: ${id}`)

    const session = await stripe.checkout.sessions.retrieve(id as string, {
      expand: ['customer_details', 'subscription']
    })

    const userId = session.metadata?.userId
    logger.info(`Retrieved userId from session metadata: ${userId}`)

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Missing userId in session metadata.'
      })
    }

    if (session.payment_status === 'paid' && session.status === 'complete') {
      logger.info(
        `Session ${id} is verified. Ensuring user subscription is updated.`
      )

      await handleCheckoutSessionCompleted(session)

      return res.status(StatusCodes.OK).json({
        status: 'verified',
        sessionId: id,
        userId,
        customerEmail: session.customer_details?.email
      })
    } else {
      logger.warn(
        `Session ${id} not marked as paid. Status: ${session.payment_status}`
      )

      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Payment session not completed or invalid.',
        payment_status: session.payment_status
      })
    }
  } catch (error) {
    if (isStripeError(error)) {
      logger.error(`Stripe error while verifying session: ${error.message}`)
    }

    throw error
  }
}

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const id = (req.user as { id: string }).id

    logger.info(`Cancelling subscription for user: ${id}`)

    const user = await findUserWithSubscription(id)

    if (!user || !user.stripeSubscriptionId) {
      logger.error(`User or subscription not found for userId: ${id}`)

      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'User or subscription not found.'
      })
    }

    const updatedSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    )

    logger.info(`Subscription for user ${id} set to cancel at period end.`)

    const currentPeriodEnd =
      updatedSubscription.items.data[0]?.current_period_end

    await updateSubscriptionCancellation(
      id,
      currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null
    )

    logger.info(
      `User ${id} subscription marked as cancelAtPeriodEnd in database.`
    )

    res.status(StatusCodes.OK).json({
      message: 'Subscription will be canceled at the end of the current period.'
    })
  } catch (error) {
    if (isStripeError(error)) {
      logger.error(
        `Stripe error while cancelling subscription: ${error.message}`
      )
    }

    throw error
  }
}

export const getInvoices = async (req: Request, res: Response) => {
  const id = (req.user as { id: string }).id
  const user = await findUserWithSubscription(id)

  if (!user?.stripeCustomerId) {
    return res.status(StatusCodes.OK).json({ invoices: [] })
  }

  const invoices = await stripe.invoices.list({
    customer: user.stripeCustomerId,
    limit: 24
  })

  const mapped = invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    date: inv.created,
    amount: inv.amount_paid,
    currency: inv.currency,
    status: inv.status,
    pdfUrl: inv.invoice_pdf
  }))

  res.status(StatusCodes.OK).json({ invoices: mapped })
}

export const restoreSubscription = async (req: Request, res: Response) => {
  const id = (req.user as { id: string }).id

  const user = await findUserWithSubscription(id)

  if (!user?.stripeSubscriptionId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: 'Subscription not found.' })
  }

  const subscription = await stripe.subscriptions.retrieve(
    user.stripeSubscriptionId
  )

  if (!subscription.cancel_at_period_end) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Subscription is not set to cancel or is already active.'
    })
  }

  if (subscription.status === 'canceled') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Subscription is already canceled. Please start a new one.'
    })
  }

  const updatedSubscription = await stripe.subscriptions.update(
    user.stripeSubscriptionId,
    {
      cancel_at_period_end: false
    }
  )

  await updateSubscriptionRestored(id, updatedSubscription.status)

  res
    .status(StatusCodes.OK)
    .json({ message: 'Subscription resumed successfully.' })
}
