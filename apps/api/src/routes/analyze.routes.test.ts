import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '../app'
import { openAiClient, prisma } from '../server'

vi.mock('../server')

vi.mock('../lib/getEnv')

vi.mock('../config/limiter.config', () => ({
  authAttemptLimiter: (_req: never, _res: never, next: () => void) => next(),
  analyzeLimiter: (_req: never, _res: never, next: () => void) => next(),
  requestLimiter: (_req: never, _res: never, next: () => void) => next(),
  userAnalyzeLimiter: (_req: never, _res: never, next: () => void) => next()
}))

vi.mock('../middleware/require-auth.middleware', () => ({
  requireAuth: vi.fn((req, _res, next) => {
    req.user = {
      id: 'user-id',
      email: 'test@test.com',
      isPremium: false,
      subscriptionCurrentPeriodEnd: null
    }
    next()
  })
}))

vi.mock('../middleware/require-premium.middleware', () => ({
  requirePremium: vi.fn((_req, _res, next: () => void) => next())
}))

vi.mock('../controllers/helper/analyze/parseFileAndSanitize', () => ({
  parseFileAndSanitize: vi.fn()
}))

vi.mock('../controllers/helper/analyze/analyzeFile', () => ({
  analyzeFile: vi.fn()
}))

vi.mock('../controllers/helper/analyze/parseOpenAiApiResponse', () => ({
  parseOpenAiApiResponse: vi.fn()
}))

vi.mock('../controllers/helper/analyze/saveRequestLog', () => ({
  saveRequestLog: vi.fn()
}))

vi.mock('../controllers/helper/handleError', () => ({
  handleError: vi.fn()
}))

import { analyzeFile } from '../controllers/helper/analyze/analyzeFile'
import { parseFileAndSanitize } from '../controllers/helper/analyze/parseFileAndSanitize'
import { parseOpenAiApiResponse } from '../controllers/helper/analyze/parseOpenAiApiResponse'
import { requireAuth } from '../middleware/require-auth.middleware'
import { requirePremium } from '../middleware/require-premium.middleware'

const API_URL = '/api/cv'
const FAKE_PDF = Buffer.from('%PDF-1.4 fake pdf content for testing')
const PDF_OPTS = { filename: 'resume.pdf', contentType: 'application/pdf' }

describe('POST /api/cv/analyze/free', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when no file is attached', async () => {
    const res = await request(app).post(`${API_URL}/analyze/free`)
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 when analysis returns an error', async () => {
    vi.mocked(parseFileAndSanitize).mockResolvedValue('parsed text' as never)
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)

    const res = await request(app)
      .post(`${API_URL}/analyze/free`)
      .attach('file', FAKE_PDF, PDF_OPTS)
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 with analysis result on success', async () => {
    vi.mocked(parseFileAndSanitize).mockResolvedValue('parsed text' as never)
    vi.mocked(analyzeFile).mockResolvedValue({
      id: 'ai-123',
      score: 90
    } as never)

    const res = await request(app)
      .post(`${API_URL}/analyze/free`)
      .attach('file', FAKE_PDF, PDF_OPTS)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      id: 'ai-123',
      score: 90,
      parsed_file: 'parsed text'
    })
  })
})

describe('POST /api/cv/analyze/signed-in', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app)
      .post(`${API_URL}/analyze/signed-in`)
      .attach('file', FAKE_PDF, PDF_OPTS)
    expect(res.statusCode).toBe(401)
  })

  it('returns 400 when no file is attached', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })

    const res = await request(app).post(`${API_URL}/analyze/signed-in`)
    expect(res.statusCode).toBe(400)
  })

  it('returns 200 with analysis result on success', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user-id',
        email: 'test@test.com',
        isPremium: false,
        subscriptionCurrentPeriodEnd: null
      }
      next()
    })
    vi.mocked(parseFileAndSanitize).mockResolvedValue('parsed text' as never)
    vi.mocked(analyzeFile).mockResolvedValue({
      id: 'ai-456',
      score: 85
    } as never)

    const res = await request(app)
      .post(`${API_URL}/analyze/signed-in`)
      .attach('file', FAKE_PDF, PDF_OPTS)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ id: 'ai-456' })
  })
})

describe('POST /api/cv/analyze/premium', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app)
      .post(`${API_URL}/analyze/premium`)
      .attach('file', FAKE_PDF, PDF_OPTS)
    expect(res.statusCode).toBe(401)
  })

  it('returns 403 when user is not premium', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(requirePremium).mockImplementation((_req, res, _next) => {
      res.status(403).json({ message: 'Premium access required' })
      return undefined
    })

    const res = await request(app)
      .post(`${API_URL}/analyze/premium`)
      .attach('file', FAKE_PDF, PDF_OPTS)
    expect(res.statusCode).toBe(403)
  })

  it('returns 200 on success for premium user', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user-id',
        email: 'test@test.com',
        isPremium: true,
        subscriptionCurrentPeriodEnd: new Date(Date.now() + 86400000)
      }
      next()
    })
    vi.mocked(requirePremium).mockImplementation((_req, _res, next) => {
      next()
      return undefined
    })
    vi.mocked(parseFileAndSanitize).mockResolvedValue('parsed text' as never)
    vi.mocked(analyzeFile).mockResolvedValue({
      id: 'ai-789',
      score: 95
    } as never)

    const res = await request(app)
      .post(`${API_URL}/analyze/premium`)
      .attach('file', FAKE_PDF, PDF_OPTS)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ id: 'ai-789' })
  })
})

describe('GET /api/cv/analysis/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with analysis data', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'user-id'
    } as never)
    vi.mocked(openAiClient.responses.retrieve).mockResolvedValue({
      id: 'ai-123',
      output_text: '{"score": 90}'
    } as never)
    vi.mocked(parseOpenAiApiResponse).mockReturnValue({ score: 90 } as never)

    const res = await request(app).get(`${API_URL}/analysis/ai-123`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ score: 90 })
  })
})

describe('GET /api/cv/analysis/:id/parsed-file', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(requireAuth).mockImplementation((_req, res, _next) => {
      res.status(401).json({ message: 'Unauthorized' })
    })

    const res = await request(app).get(`${API_URL}/analysis/ai-123/parsed-file`)
    expect(res.statusCode).toBe(401)
  })

  it('returns 403 when user is not the owner', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'other-user-id' }
      next()
    })
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'owner-id'
    } as never)
    vi.mocked(openAiClient.responses.inputItems.list).mockResolvedValue({
      data: [{ content: [{ text: 'resume text' }] }]
    } as never)

    const res = await request(app).get(`${API_URL}/analysis/ai-123/parsed-file`)
    expect(res.statusCode).toBe(403)
  })

  it('returns 200 with parsed file for the owner', async () => {
    vi.mocked(requireAuth).mockImplementation((req, _res, next) => {
      req.user = { id: 'user-id' }
      next()
    })
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'user-id'
    } as never)
    vi.mocked(openAiClient.responses.inputItems.list).mockResolvedValue({
      data: [{ content: [{ text: 'resume text' }] }]
    } as never)

    const res = await request(app).get(`${API_URL}/analysis/ai-123/parsed-file`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ parsed_file: 'resume text' })
  })
})

describe('GET /api/cv/analysis-history/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with paginated history', async () => {
    vi.mocked(prisma.requestLog.findMany).mockResolvedValue([
      {
        analyseId: 'ai-1',
        createdAt: new Date(),
        fileName: 'cv.pdf',
        fileSize: 1024
      }
    ] as never)

    const res = await request(app).get(`${API_URL}/analysis-history/user-id`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      pagination: { nextCursor: null, hasMore: false, pageSize: 10 }
    })
    expect(res.body.logs).toHaveLength(1)
  })

  it('returns 200 respecting pagination params', async () => {
    vi.mocked(prisma.requestLog.findMany).mockResolvedValue([])

    const res = await request(app).get(
      `${API_URL}/analysis-history/user-id?limit=5`
    )
    expect(res.statusCode).toBe(200)
    expect(res.body.pagination).toMatchObject({
      nextCursor: null,
      hasMore: false,
      pageSize: 5
    })
  })
})
