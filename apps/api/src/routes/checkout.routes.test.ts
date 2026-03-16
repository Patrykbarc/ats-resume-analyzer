import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../app'
import { prisma } from '../server'

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

vi.mock('../server')

vi.mock('../lib/getEnv')

vi.mock('../config/limiter.config', () => ({
  authAttemptLimiter: (_req: never, _res: never, next: () => void) => next(),
  analyzeLimiter: (_req: never, _res: never, next: () => void) => next(),
  requestLimiter: (_req: never, _res: never, next: () => void) => next(),
  userAnalyzeLimiter: (_req: never, _res: never, next: () => void) => next()
}))

vi.mock('../services/email.service', () => ({
  sendRegisterConfirmationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}))

vi.mock('../middleware/require-auth.middleware', () => ({
  requireAuth: vi.fn((req, _res, next) => {
    req.user = { id: 'user-id' }
    next()
  })
}))

vi.mock(
  '../controllers/helper/checkout/handleCheckoutSessionCompleted',
  () => ({
    handleCheckoutSessionCompleted: vi.fn()
  })
)

vi.mock('../controllers/helper/checkout/handleSubscriptionUpdated', () => ({
  handleSubscriptionUpdated: vi.fn()
}))

vi.mock('../controllers/helper/checkout/handleSubscriptionDeleted', () => ({
  handleSubscriptionDeleted: vi.fn()
}))

vi.mock('../controllers/helper/checkout/handleInvoicePaymentFailed', () => ({
  handleInvoicePaymentFailed: vi.fn()
}))


vi.mock('../lib/isStripeError', () => ({
  isStripeError: vi.fn(() => false)
}))

import { handleCheckoutSessionCompleted } from '../controllers/helper/checkout/handleCheckoutSessionCompleted'
import { requireAuth } from '../middleware/require-auth.middleware'

const API_URL = '/api/checkout'

describe('POST /api/checkout/create-checkout-session', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app)
      .post(`${API_URL}/create-checkout-session`)
      .send({ id: 'price-id' })
    expect(res.statusCode).toBe(401)
  })

  it('returns 400 when id is missing', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })

    const res = await request(app)
      .post(`${API_URL}/create-checkout-session`)
      .send({})
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 with checkout URL on success', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    mockStripe.checkout.sessions.create.mockResolvedValue({
      url: 'https://checkout.stripe.com/session-url'
    })

    const res = await request(app)
      .post(`${API_URL}/create-checkout-session`)
      .send({ id: 'price-id' })
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      url: 'https://checkout.stripe.com/session-url'
    })
  })
})

describe('POST /api/checkout/checkout-session-webhook', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when stripe signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await request(app)
      .post(`${API_URL}/checkout-session-webhook`)
      .set('stripe-signature', 'invalid-sig')
      .send('raw-body')
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 and handles checkout.session.completed event', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_123', metadata: { userId: 'user-id' } } }
    }
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)
    vi.mocked(handleCheckoutSessionCompleted).mockResolvedValue(null as never)

    const res = await request(app)
      .post(`${API_URL}/checkout-session-webhook`)
      .set('stripe-signature', 'valid-sig')
      .send('raw-body')
    expect(res.statusCode).toBe(200)
    expect(handleCheckoutSessionCompleted).toHaveBeenCalledWith(
      mockEvent.data.object
    )
  })

  it('returns 200 and handles customer.subscription.updated event', async () => {
    const mockEvent = {
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_123' } }
    }
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    const res = await request(app)
      .post(`${API_URL}/checkout-session-webhook`)
      .set('stripe-signature', 'valid-sig')
      .send('raw-body')
    expect(res.statusCode).toBe(200)
  })

  it('returns 200 and handles customer.subscription.deleted event', async () => {
    const mockEvent = {
      type: 'customer.subscription.deleted',
      data: { object: { id: 'sub_123' } }
    }
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    const res = await request(app)
      .post(`${API_URL}/checkout-session-webhook`)
      .set('stripe-signature', 'valid-sig')
      .send('raw-body')
    expect(res.statusCode).toBe(200)
  })

  it('returns 200 and handles invoice.payment_failed event', async () => {
    const mockEvent = {
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_123' } }
    }
    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent)

    const res = await request(app)
      .post(`${API_URL}/checkout-session-webhook`)
      .set('stripe-signature', 'valid-sig')
      .send('raw-body')
    expect(res.statusCode).toBe(200)
  })
})

describe('GET /api/checkout/verify-payment', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app).get(`${API_URL}/verify-payment?id=cs_123`)
    expect(res.statusCode).toBe(401)
  })

  it('returns 400 when id query param is missing', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })

    const res = await request(app).get(`${API_URL}/verify-payment`)
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when session is not paid', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
      payment_status: 'unpaid',
      status: 'open',
      metadata: { userId: 'user-id' },
      customer_details: { email: 'test@test.com' }
    })

    const res = await request(app).get(`${API_URL}/verify-payment?id=cs_123`)
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 when session is verified', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
      payment_status: 'paid',
      status: 'complete',
      metadata: { userId: 'user-id' },
      customer_details: { email: 'test@test.com' }
    })
    vi.mocked(handleCheckoutSessionCompleted).mockResolvedValue(null as never)

    const res = await request(app).get(`${API_URL}/verify-payment?id=cs_123`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      status: 'verified',
      sessionId: 'cs_123',
      userId: 'user-id'
    })
  })
})

describe('POST /api/checkout/cancel-subscription', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app)
      .post(`${API_URL}/cancel-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(401)
  })

  it('returns 400 when id is missing', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })

    const res = await request(app)
      .post(`${API_URL}/cancel-subscription`)
      .send({})
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when user or subscription not found', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post(`${API_URL}/cancel-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(404)
  })

  it('returns 200 on successful cancellation', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: 'sub_456'
    } as never)
    mockStripe.subscriptions.update.mockResolvedValue({
      items: {
        data: [{ current_period_end: Math.floor(Date.now() / 1000) + 86400 }]
      }
    })
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const res = await request(app)
      .post(`${API_URL}/cancel-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(200)
    expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_456', {
      cancel_at_period_end: true
    })
  })
})

describe('POST /api/checkout/restore-subscription', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app)
      .post(`${API_URL}/restore-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(401)
  })

  it('returns 400 when id is missing', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })

    const res = await request(app)
      .post(`${API_URL}/restore-subscription`)
      .send({})
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when subscription not found', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post(`${API_URL}/restore-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(404)
  })

  it('returns 400 when subscription is not set to cancel', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: 'sub_456'
    } as never)
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      cancel_at_period_end: false,
      status: 'active'
    })

    const res = await request(app)
      .post(`${API_URL}/restore-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when subscription is already canceled', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: 'sub_456'
    } as never)
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      cancel_at_period_end: true,
      status: 'canceled'
    })

    const res = await request(app)
      .post(`${API_URL}/restore-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 on successful restoration', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: 'sub_456'
    } as never)
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      cancel_at_period_end: true,
      status: 'active'
    })
    mockStripe.subscriptions.update.mockResolvedValue({ status: 'active' })
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const res = await request(app)
      .post(`${API_URL}/restore-subscription`)
      .send({ id: 'user-id' })
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      message: 'Subscription resumed successfully.'
    })
  })
})
