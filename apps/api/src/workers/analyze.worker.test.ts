import { beforeEach, describe, expect, it, vi } from 'vitest'
import { jobResults } from '../config/job-results'
import { analyzeFile } from '../controllers/helper/analyze/analyzeFile'
import { logger, prisma } from '../server'
import { processAnalyzeJob, type AnalyzeJobData } from './analyze.worker'

vi.mock('../server')

vi.mock('../controllers/helper/analyze/analyzeFile', () => ({
  analyzeFile: vi.fn()
}))

const makeJobData = (
  overrides: Partial<AnalyzeJobData> = {}
): AnalyzeJobData => ({
  extractedText: 'Resume text here',
  isPremium: false,
  userId: null,
  fileName: undefined,
  fileSize: undefined,
  ipAddress: undefined,
  userAgent: undefined,
  ...overrides
})

describe('processAnalyzeJob — success (anonymous)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    jobResults.clear()
  })

  it('sets status to PROCESSING then COMPLETED', async () => {
    const analysisResult = { id: 'analysis-id', score: 90 }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData())

    expect(prisma.analysisJob.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'job-test-id' },
      data: { status: 'PROCESSING' }
    })
    expect(prisma.analysisJob.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'job-test-id' },
      data: { status: 'COMPLETED', resultId: 'analysis-id' }
    })
  })

  it('calls analyzeFile with correct arguments', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData({ isPremium: true }))

    expect(analyzeFile).toHaveBeenCalledWith('Resume text here', {
      premium: true
    })
  })

  it('stores result in memory with correct key and payload', async () => {
    const analysisResult = { id: 'analysis-id', score: 80 }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData())

    expect(jobResults.get('job-test-id')).toMatchObject({
      ...analysisResult,
      parsed_file: 'Resume text here',
      user: null
    })
  })

  it('does NOT call prisma.user.update when userId is null', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData({ userId: null }))

    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})

describe('processAnalyzeJob — success (authenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    jobResults.clear()
  })

  it('calls prisma.user.update with requestLogs.create containing all fields', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(
      'job-test-id',
      makeJobData({
        userId: 'user-123',
        fileName: 'resume.pdf',
        fileSize: 1024,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        isPremium: true
      })
    )

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: {
        requestLogs: {
          create: {
            analyseId: 'analysis-id',
            fileName: 'resume.pdf',
            fileSize: 1024,
            isPremiumRequest: true,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0'
          }
        }
      }
    })
  })

  it('stores user: { id: userId } in result data', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData({ userId: 'user-123' }))

    expect(jobResults.get('job-test-id')).toMatchObject({
      user: { id: 'user-123' }
    })
  })

  it('decodes fileName from latin1 to utf8 correctly', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    const latin1Encoded = Buffer.from('résumé', 'utf8').toString('latin1')

    await processAnalyzeJob(
      'job-test-id',
      makeJobData({ userId: 'user-123', fileName: latin1Encoded })
    )

    const call = vi.mocked(prisma.user.update).mock.calls[0][0] as {
      data: { requestLogs: { create: { fileName: string } } }
    }
    expect(call.data.requestLogs.create.fileName).toBe('résumé')
  })

  it('sets fileName: null in request log when fileName is undefined', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(
      'job-test-id',
      makeJobData({ userId: 'user-123', fileName: undefined })
    )

    const call = vi.mocked(prisma.user.update).mock.calls[0][0] as {
      data: { requestLogs: { create: { fileName: string | null } } }
    }
    expect(call.data.requestLogs.create.fileName).toBeNull()
  })
})

describe('processAnalyzeJob — analyzeFile returns error', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    jobResults.clear()
  })

  it('sets status to FAILED with error message', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData())

    expect(prisma.analysisJob.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'job-test-id' },
      data: { status: 'FAILED', error: 'AI failed' }
    })
  })

  it('does NOT store result in memory when analyzeFile fails', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData())

    expect(jobResults.has('job-test-id')).toBe(false)
  })

  it('does NOT call prisma.user.update even with userId set', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData({ userId: 'user-123' }))

    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('calls analysisJob.update exactly twice (PROCESSING + FAILED)', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob('job-test-id', makeJobData())

    expect(prisma.analysisJob.update).toHaveBeenCalledTimes(2)
  })
})

describe('processAnalyzeJob — requestLogs failure does not override COMPLETED', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    jobResults.clear()
  })

  it('job remains COMPLETED when prisma.user.update throws', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ id: 'analysis-id' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB lost'))

    await processAnalyzeJob('job-test-id', makeJobData({ userId: 'user-123' }))

    expect(prisma.analysisJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'COMPLETED', resultId: 'analysis-id' }
      })
    )
    expect(prisma.analysisJob.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' })
      })
    )
  })

  it('logs error when requestLogs creation fails', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ id: 'analysis-id' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB lost'))

    await processAnalyzeJob('job-test-id', makeJobData({ userId: 'user-123' }))

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: 'job-test-id' }),
      expect.stringContaining('analysis still completed')
    )
  })
})

describe('processAnalyzeJob — unexpected error sets FAILED and re-throws', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    jobResults.clear()
  })

  it('sets status FAILED and re-throws when analyzeFile throws unexpectedly', async () => {
    vi.mocked(analyzeFile).mockRejectedValue(new Error('Network error'))
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await expect(
      processAnalyzeJob('job-test-id', makeJobData())
    ).rejects.toThrow('Network error')

    expect(prisma.analysisJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' })
      })
    )
  })
})
