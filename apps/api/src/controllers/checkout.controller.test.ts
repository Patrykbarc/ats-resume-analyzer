import type { Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockStripe = vi.hoisted(() => ({
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn()
    }
  },
  webhooks: {
    constructEvent: vi.fn()
  },
  subscriptions: {
    update: vi.fn(),
    retrieve: vi.fn()
  }
}))

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe)
}))

vi.mock('../server', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  },
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() }
}))

vi.mock('../lib/getEnv', () => ({
  getEnvs: vi.fn(() => ({
    STRIPE_SECRET_KEY: 'test-stripe-key',
    STRIPE_WEBHOOK_SECRET: 'test-webhook-secret',
    FRONTEND_URL: 'http://localhost:3000',
    JWT_SECRET: 'test-jwt-secret',
    JWT_REFRESH_SECRET: 'test-jwt-refresh-secret',
    NODE_ENV: 'test'
  }))
}))

vi.mock('./helper/checkout/handleCheckoutSessionCompleted', () => ({
  handleCheckoutSessionCompleted: vi.fn()
}))

vi.mock('./helper/checkout/handleSubscriptionUpdated', () => ({
  handleSubscriptionUpdated: vi.fn()
}))

vi.mock('./helper/checkout/handleSubscriptionDeleted', () => ({
  handleSubscriptionDeleted: vi.fn()
}))

vi.mock('./helper/checkout/handleInvoicePaymentFailed', () => ({
  handleInvoicePaymentFailed: vi.fn()
}))

vi.mock('./helper/handleError', () => ({
  handleError: vi.fn()
}))

vi.mock('../lib/isStripeError', () => ({
  isStripeError: vi.fn(() => false)
}))

import { prisma } from '../server'
import { cancelSubscription, stripeWebhookHandler } from './checkout.controller'
import { handleCheckoutSessionCompleted } from './helper/checkout/handleCheckoutSessionCompleted'

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    cookies: {},
    headers: {},
    query: {},
    params: {},
    user: undefined,
    ...overrides
  }) as unknown as Request

const makeRes = (): Response => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis()
  }
  return res as unknown as Response
}

describe('stripeWebhookHandler', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Webhook signature verification failed')
    })

    const res = makeRes()
    await stripeWebhookHandler(
      makeReq({ headers: { 'stripe-signature': 'invalid-sig' }, body: 'raw' }),
      res
    )

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('handles checkout.session.completed event and returns 200', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_123', metadata: { userId: 'u_123' } } }
    }
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
    vi.mocked(handleCheckoutSessionCompleted).mockResolvedValue(null)

    const res = makeRes()
    await stripeWebhookHandler(
      makeReq({ headers: { 'stripe-signature': 'valid-sig' }, body: 'raw' }),
      res
    )

    expect(handleCheckoutSessionCompleted).toHaveBeenCalledWith(
      mockEvent.data.object
    )
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('handles customer.subscription.updated event', async () => {
    const mockEvent = {
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_123' } }
    }
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    const res = makeRes()
    await stripeWebhookHandler(
      makeReq({ headers: { 'stripe-signature': 'valid-sig' }, body: 'raw' }),
      res
    )

    expect(res.status).toHaveBeenCalledWith(200)
  })
})

describe('cancelSubscription', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 when user is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = makeRes()
    await cancelSubscription(makeReq({ user: { id: 'u_123' } }), res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 404 when stripeSubscriptionId is null', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u_123',
      stripeSubscriptionId: null
    } as never)

    const res = makeRes()
    await cancelSubscription(makeReq({ user: { id: 'u_123' } }), res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('cancels the subscription and returns 200', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'u_123',
      stripeSubscriptionId: 'sub_456'
    } as never)
    mockStripe.subscriptions.update.mockResolvedValue({
      items: {
        data: [{ current_period_end: Math.floor(Date.now() / 1000) + 86400 }]
      }
    })
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const res = makeRes()
    await cancelSubscription(makeReq({ user: { id: 'u_123' } }), res)

    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_456', {
      cancel_at_period_end: true
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
