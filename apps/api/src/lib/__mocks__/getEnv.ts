import { vi } from 'vitest'

export const getEnvs = vi.fn(() => ({
  JWT_SECRET: 'test-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  NODE_ENV: 'test',
  FRONTEND_URL: 'http://localhost:3000',
  STRIPE_SECRET_KEY: 'test-stripe-key',
  STRIPE_WEBHOOK_SECRET: 'test-webhook-secret',
  RESEND_API_KEY: 'test-resend-key',
  OPENAI_API_KEY: 'test-openai-key',
  DATABASE_URL: 'postgresql://test'
}))
