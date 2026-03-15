import { captureException } from '@sentry/core'

export type LogMeta = {
  context?: string
  [key: string]: unknown
}

export const sentryLogger = {
  // Expected errors - situations we anticipated could happen.
  // Examples: OpenAI 429, validation errors, known 4xx responses.
  // Sent to Sentry at 'warning' level.
  expected(error: unknown, meta?: LogMeta): void {
    captureException(error, { level: 'warning', extra: meta })
  },

  // Unexpected errors - bugs, unknown failures, unhandled edge cases.
  // Examples: database crashes, unhandled controller exceptions.
  // Sent to Sentry at 'error' level.
  unexpected(error: unknown, meta?: LogMeta): void {
    captureException(error, { level: 'error', extra: meta })
  }
}
