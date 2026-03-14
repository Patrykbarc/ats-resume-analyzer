import type { Request, Response } from 'express'
import { vi } from 'vitest'

export const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    cookies: {},
    headers: {},
    query: {},
    params: {},
    ...overrides
  }) as Request

export const makeRes = (): Response => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis()
  }
  return res as unknown as Response
}
