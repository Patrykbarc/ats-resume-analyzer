import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockStripe = vi.hoisted(() => ({
  subscriptions: { cancel: vi.fn() }
}))

vi.mock('stripe', () => ({ default: vi.fn(() => mockStripe) }))

vi.mock('../services/checkout.service', () => ({
  findUserWithSubscription: vi.fn()
}))

vi.mock('../server')

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn()
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mocked-token'),
    verify: vi.fn()
  }
}))

vi.mock('../lib/getEnv')

vi.mock('../services/email.service', () => ({
  sendRegisterConfirmationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}))

vi.mock('./helper/auth/createNewUser', () => ({
  createNewUser: vi.fn()
}))

vi.mock('./helper/auth/handleNewJwtTokens', () => ({
  handleNewJwtTokens: vi.fn(() => Promise.resolve('mocked-access-token')),
  jwtRefreshCookieOptions: vi.fn(() => ({
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }))
}))

vi.mock('./helper/auth/verifyIsTokenExpired', () => ({
  verifyIsTokenExpired: vi.fn()
}))

import * as bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../server'
import { findUserWithSubscription } from '../services/checkout.service'
import { sendRegisterConfirmationEmail } from '../services/email.service'
import { makeReq, makeRes } from '../test/helpers'
import {
  deleteAccount,
  loginUser,
  refreshToken,
  registerUser
} from './auth.controller'
import { createNewUser } from './helper/auth/createNewUser'
import { handleNewJwtTokens } from './helper/auth/handleNewJwtTokens'

describe('loginUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    await loginUser(
      makeReq({ body: { email: 'a@b.com', password: 'pw' } }),
      makeRes()
    )
    const res = makeRes()
    await loginUser(
      makeReq({ body: { email: 'a@b.com', password: 'pw' } }),
      res
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 403 when email is not confirmed', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      password: 'hashed',
      isEmailConfirmed: false
    } as never)

    const res = makeRes()
    await loginUser(
      makeReq({ body: { email: 'a@b.com', password: 'pw' } }),
      res
    )
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('returns 401 when password is invalid', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      password: 'hashed',
      isEmailConfirmed: true
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const res = makeRes()
    await loginUser(
      makeReq({ body: { email: 'a@b.com', password: 'wrong' } }),
      res
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 200 with token on successful login', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      password: 'hashed',
      isEmailConfirmed: true
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(handleNewJwtTokens).mockResolvedValue('access-token')

    const res = makeRes()
    await loginUser(
      makeReq({ body: { email: 'a@b.com', password: 'correct' } }),
      res
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ token: 'access-token' })
  })
})

describe('registerUser', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 409 when user already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'a@b.com'
    } as never)

    const res = makeRes()
    await registerUser(
      makeReq({ body: { email: 'a@b.com', password: 'pw' } }),
      res
    )
    expect(res.status).toHaveBeenCalledWith(409)
  })

  it('returns 201 on successful registration', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(createNewUser).mockResolvedValue({
      confirmationToken: 'token123'
    } as never)
    vi.mocked(sendRegisterConfirmationEmail).mockResolvedValue(
      undefined as never
    )

    const res = makeRes()
    await registerUser(
      makeReq({ body: { email: 'new@b.com', password: 'pw' } }),
      res
    )
    expect(res.status).toHaveBeenCalledWith(201)
  })
})

describe('refreshToken', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when refresh token cookie is missing', async () => {
    const res = makeRes()
    await refreshToken(makeReq({ cookies: {} }), res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 401 when user is not found with the provided refresh token', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: '1' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = makeRes()
    await refreshToken(makeReq({ cookies: { jwt_refresh: 'old-token' } }), res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns 200 with a new access token on success', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: '1' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      refreshToken: 'valid-refresh'
    } as never)
    vi.mocked(handleNewJwtTokens).mockResolvedValue('new-access-token')

    const res = makeRes()
    await refreshToken(
      makeReq({ cookies: { jwt_refresh: 'valid-refresh' } }),
      res
    )

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ token: 'new-access-token' })
  })
})

describe('deleteAccount', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 when user is not found', async () => {
    vi.mocked(findUserWithSubscription).mockResolvedValue(null)

    const res = makeRes()
    await deleteAccount(makeReq({ user: { id: 'user-id' } }), res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 200 and skips Stripe when user has no subscription', async () => {
    vi.mocked(findUserWithSubscription).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: null,
      subscriptionStatus: null
    } as never)
    vi.mocked(prisma.requestLog.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(prisma.user.delete).mockResolvedValue({} as never)

    const res = makeRes()
    await deleteAccount(makeReq({ user: { id: 'user-id' } }), res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(mockStripe.subscriptions.cancel).not.toHaveBeenCalled()
  })

  it('returns 200 and cancels Stripe when subscription is active', async () => {
    vi.mocked(findUserWithSubscription).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: 'sub_1',
      subscriptionStatus: 'active'
    } as never)
    mockStripe.subscriptions.cancel.mockResolvedValue({})
    vi.mocked(prisma.requestLog.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(prisma.user.delete).mockResolvedValue({} as never)

    const res = makeRes()
    await deleteAccount(makeReq({ user: { id: 'user-id' } }), res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_1')
  })

  it('returns 200 and skips Stripe when subscription is already canceled', async () => {
    vi.mocked(findUserWithSubscription).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: 'sub_1',
      subscriptionStatus: 'canceled'
    } as never)
    vi.mocked(prisma.requestLog.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(prisma.user.delete).mockResolvedValue({} as never)

    const res = makeRes()
    await deleteAccount(makeReq({ user: { id: 'user-id' } }), res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(mockStripe.subscriptions.cancel).not.toHaveBeenCalled()
  })

  it('calls clearCookie on success', async () => {
    vi.mocked(findUserWithSubscription).mockResolvedValue({
      id: 'user-id',
      stripeSubscriptionId: null,
      subscriptionStatus: null
    } as never)
    vi.mocked(prisma.requestLog.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(prisma.user.delete).mockResolvedValue({} as never)

    const res = makeRes()
    await deleteAccount(makeReq({ user: { id: 'user-id' } }), res)
    expect(res.clearCookie).toHaveBeenCalledWith(
      'jwt_refresh',
      expect.any(Object)
    )
  })
})
