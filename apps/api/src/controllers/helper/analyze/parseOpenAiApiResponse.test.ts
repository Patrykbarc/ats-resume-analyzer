import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../server', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  },
  prisma: {},
  openAiClient: {}
}))

import type { AnalyseApiResponse } from './analyzeFile'
import { parseOpenAiApiResponse } from './parseOpenAiApiResponse'

describe('parseOpenAiApiResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('parses a valid JSON response and merges the id', () => {
    const analysisData = { score: 85, keywords: ['TypeScript', 'React'] }
    const response: AnalyseApiResponse = {
      id: 'resp-test-id',
      output_text: JSON.stringify(analysisData)
    }

    const result = parseOpenAiApiResponse(response)

    expect(result).toEqual({ ...analysisData, id: 'resp-test-id' })
  })

  it('returns an error object when JSON is invalid', () => {
    const response: AnalyseApiResponse = {
      id: 'resp-test-id',
      output_text: 'not valid json {'
    }

    const result = parseOpenAiApiResponse(response)

    expect(result).toHaveProperty('error')
    expect((result as { error: string }).error).toContain(
      'Failed to parse AI response as JSON'
    )
  })

  it('includes truncated raw output in the error message', () => {
    const longInvalidOutput = 'x'.repeat(300)
    const response: AnalyseApiResponse = {
      id: 'resp-test-id',
      output_text: longInvalidOutput
    }

    const result = parseOpenAiApiResponse(response) as { error: string }

    expect(result.error).toContain('...')
    expect(result.error.length).toBeLessThan(longInvalidOutput.length + 100)
  })
})
