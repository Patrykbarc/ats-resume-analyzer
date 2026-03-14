import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../app'
import { prisma } from '../server'

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

vi.mock('../controllers/helper/auth/createNewUser', () => ({
  createNewUser: vi.fn()
}))

vi.mock('../controllers/helper/auth/handleNewJwtTokens', () => ({
  handleNewJwtTokens: vi.fn(() => Promise.resolve('mocked-access-token'))
}))

vi.mock('../controllers/helper/auth/verifyIsTokenExpired', () => ({
  verifyIsTokenExpired: vi.fn()
}))

vi.mock('../middleware/require-auth.middleware', () => ({
  requireAuth: vi.fn((req, _res, next) => {
    req.user = { id: 'user-id' }
    next()
  })
}))

import * as bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createNewUser } from '../controllers/helper/auth/createNewUser'
import { handleNewJwtTokens } from '../controllers/helper/auth/handleNewJwtTokens'
import { verifyIsTokenExpired } from '../controllers/helper/auth/verifyIsTokenExpired'
import { requireAuth } from '../middleware/require-auth.middleware'
import {
  sendPasswordResetEmail,
  sendRegisterConfirmationEmail
} from '../services/email.service'

const API_URL = '/api/auth'

const validLoginBody = { email: 'test@test.com', password: 'testP4ss' }
const validRegisterBody = {
  email: 'test@test.com',
  password: 'testP4ssword',
  confirmPassword: 'testP4ssword'
}
const validResetBody = {
  token: 'reset-token',
  password: 'newP4ssword',
  confirmPassword: 'newP4ssword'
}

describe('POST /api/auth/login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when body is missing required fields', async () => {
    const res = await request(app).post(`${API_URL}/login`).send({})
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post(`${API_URL}/login`)
      .send({ email: 'not-an-email', password: 'testP4ss' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 401 when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app).post(`${API_URL}/login`).send(validLoginBody)
    expect(res.statusCode).toBe(401)
  })

  it('returns 403 when email is not confirmed', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashed',
      isEmailConfirmed: false
    } as never)

    const res = await request(app).post(`${API_URL}/login`).send(validLoginBody)
    expect(res.statusCode).toBe(403)
  })

  it('returns 401 when password is invalid', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashed',
      isEmailConfirmed: true
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

    const res = await request(app).post(`${API_URL}/login`).send(validLoginBody)
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 with token on success', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashed',
      isEmailConfirmed: true
    } as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(handleNewJwtTokens).mockResolvedValue('access-token')

    const res = await request(app).post(`${API_URL}/login`).send(validLoginBody)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ token: 'access-token' })
  })
})

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when body is missing required fields', async () => {
    const res = await request(app).post(`${API_URL}/register`).send({})
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when passwords do not match', async () => {
    const res = await request(app).post(`${API_URL}/register`).send({
      email: 'test@test.com',
      password: 'testP4ssword',
      confirmPassword: 'Different1'
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 409 when user already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@test.com'
    } as never)

    const res = await request(app)
      .post(`${API_URL}/register`)
      .send(validRegisterBody)
    expect(res.statusCode).toBe(409)
  })

  it('returns 201 on successful registration', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(createNewUser).mockResolvedValue({
      confirmationToken: 'token123'
    } as never)
    vi.mocked(sendRegisterConfirmationEmail).mockResolvedValue(
      undefined as never
    )

    const res = await request(app)
      .post(`${API_URL}/register`)
      .send(validRegisterBody)
    expect(res.statusCode).toBe(201)
  })

  it('returns 201 when email fails to send', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(createNewUser).mockResolvedValue({
      confirmationToken: 'token123'
    } as never)
    vi.mocked(sendRegisterConfirmationEmail).mockRejectedValue(
      new Error('SMTP error')
    )

    const res = await request(app)
      .post(`${API_URL}/register`)
      .send(validRegisterBody)
    expect(res.statusCode).toBe(201)
  })
})

describe('POST /api/auth/refresh', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when refresh token cookie is missing', async () => {
    const res = await request(app).post(`${API_URL}/refresh`).send({})
    expect(res.statusCode).toBe(401)
  })

  it('returns 401 when user is not found with the provided refresh token', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: '1' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post(`${API_URL}/refresh`)
      .set('Cookie', 'jwt_refresh=old-token')
      .send({})
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 with new access token on success', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: '1' } as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      refreshToken: 'valid-refresh'
    } as never)
    vi.mocked(handleNewJwtTokens).mockResolvedValue('new-access-token')

    const res = await request(app)
      .post(`${API_URL}/refresh`)
      .set('Cookie', 'jwt_refresh=valid-refresh')
      .send({})
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ token: 'new-access-token' })
  })
})

describe('POST /api/auth/verify', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 when verification token is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post(`${API_URL}/verify`)
      .send({ token: 'invalid-token' })
    expect(res.statusCode).toBe(404)
  })

  it('returns 410 when verification token has expired', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      confirmationTokenExpiry: new Date(Date.now() - 1000)
    } as never)
    vi.mocked(verifyIsTokenExpired).mockReturnValue(true)

    const res = await request(app)
      .post(`${API_URL}/verify`)
      .send({ token: 'expired-token' })
    expect(res.statusCode).toBe(410)
  })

  it('returns 200 on successful verification', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      confirmationTokenExpiry: new Date(Date.now() + 10000)
    } as never)
    vi.mocked(verifyIsTokenExpired).mockReturnValue(false)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const res = await request(app)
      .post(`${API_URL}/verify`)
      .send({ token: 'valid-token' })
    expect(res.statusCode).toBe(200)
  })
})

describe('POST /api/auth/verify/resend', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 even when user is not found (anti-enumeration)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post(`${API_URL}/verify/resend`)
      .send({ token: 'unknown-token' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 400 when email is already verified', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      isEmailConfirmed: true
    } as never)

    const res = await request(app)
      .post(`${API_URL}/verify/resend`)
      .send({ token: 'some-token' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 when verification link is resent successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      isEmailConfirmed: false
    } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    vi.mocked(sendRegisterConfirmationEmail).mockResolvedValue(
      undefined as never
    )

    const res = await request(app)
      .post(`${API_URL}/verify/resend`)
      .send({ token: 'some-token' })
    expect(res.statusCode).toBe(200)
  })
})

describe('POST /api/auth/password/request-reset', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post(`${API_URL}/password/request-reset`)
      .send({ email: 'not-an-email' })
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 even when user is not found (anti-enumeration)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post(`${API_URL}/password/request-reset`)
      .send({ email: 'unknown@test.com' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 200 and sends reset email on success', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'test@test.com'
    } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)
    vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined as never)

    const res = await request(app)
      .post(`${API_URL}/password/request-reset`)
      .send({ email: 'test@test.com' })
    expect(res.statusCode).toBe(200)
    expect(sendPasswordResetEmail).toHaveBeenCalledOnce()
  })
})

describe('POST /api/auth/password/reset', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when body is missing required fields', async () => {
    const res = await request(app).post(`${API_URL}/password/reset`).send({})
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when reset token is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post(`${API_URL}/password/reset`)
      .send(validResetBody)
    expect(res.statusCode).toBe(404)
  })

  it('returns 410 when reset token has expired', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      resetPasswordExpiry: new Date(Date.now() - 1000)
    } as never)
    vi.mocked(verifyIsTokenExpired).mockReturnValue(true)

    const res = await request(app)
      .post(`${API_URL}/password/reset`)
      .send(validResetBody)
    expect(res.statusCode).toBe(410)
  })

  it('returns 200 on successful password reset', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      resetPasswordExpiry: new Date(Date.now() + 10000)
    } as never)
    vi.mocked(verifyIsTokenExpired).mockReturnValue(false)
    vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const res = await request(app)
      .post(`${API_URL}/password/reset`)
      .send(validResetBody)
    expect(res.statusCode).toBe(200)
  })
})

describe('POST /api/auth/logout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 when no refresh cookie exists (already logged out)', async () => {
    const res = await request(app).post(`${API_URL}/logout`).send({})
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ message: 'Already logged out.' })
  })

  it('returns 200 and clears cookie on successful logout', async () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: '1' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const res = await request(app)
      .post(`${API_URL}/logout`)
      .set('Cookie', 'jwt_refresh=valid-refresh')
      .send({})
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ message: 'Logged out successfully.' })
  })
})

describe('GET /api/auth/me', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app).get(`${API_URL}/me`)
    expect(res.statusCode).toBe(401)
  })

  it('returns 404 when user is not found in database', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app).get(`${API_URL}/me`)
    expect(res.statusCode).toBe(404)
  })

  it('returns 200 with user data when authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@test.com',
      isPremium: false,
      subscriptionCurrentPeriodEnd: null
    } as never)

    const res = await request(app).get(`${API_URL}/me`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      id: 'user-id',
      email: 'test@test.com',
      isPremium: false
    })
  })

  it('returns isPremium false when subscriptionCurrentPeriodEnd is in the past', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@test.com',
      isPremium: true,
      subscriptionCurrentPeriodEnd: new Date(Date.now() - 1000)
    } as never)

    const res = await request(app).get(`${API_URL}/me`)
    expect(res.statusCode).toBe(200)
    expect(res.body.isPremium).toBe(false)
  })

  it('returns isPremium true when subscriptionCurrentPeriodEnd is in the future', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-id',
      email: 'test@test.com',
      isPremium: true,
      subscriptionCurrentPeriodEnd: new Date(Date.now() + 86400000)
    } as never)

    const res = await request(app).get(`${API_URL}/me`)
    expect(res.statusCode).toBe(200)
    expect(res.body.isPremium).toBe(true)
  })
})
