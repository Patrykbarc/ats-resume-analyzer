import { vi } from 'vitest'

export const prisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  requestLog: {
    findMany: vi.fn(),
    count: vi.fn(),
    deleteMany: vi.fn()
  },
  analysisJob: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  },
  rateLimit: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn()
  },
  $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({
    rateLimit: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn()
    }
  }))
}

export const logger = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  fatal: vi.fn()
}

export const openAiClient = {
  responses: {
    retrieve: vi.fn(),
    inputItems: {
      list: vi.fn()
    }
  }
}
