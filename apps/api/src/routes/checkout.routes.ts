import { CheckoutSessionIdSchema } from '@monorepo/schemas'
import express, { Router } from 'express'
import {
  cancelSubscription,
  createCheckoutSession,
  restoreSubscription,
  stripeWebhookHandler,
  verifyPaymentSession
} from '../controllers/checkout.controller'
import { requireAuth } from '../middleware/require-auth.middleware'
import { validateData } from '../middleware/validate-entries.middleware'

const router: Router = Router()

router.post(
  '/create-checkout-session',
  requireAuth,
  validateData(CheckoutSessionIdSchema),
  createCheckoutSession
)

router.post(
  '/checkout-session-webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler
)

router.get(
  '/verify-payment',
  requireAuth,
  validateData(CheckoutSessionIdSchema),
  verifyPaymentSession
)

router.post(
  '/cancel-subscription',
  requireAuth,
  validateData(CheckoutSessionIdSchema),
  cancelSubscription
)

router.post(
  '/restore-subscription',
  requireAuth,
  validateData(CheckoutSessionIdSchema),
  restoreSubscription
)

export default router
