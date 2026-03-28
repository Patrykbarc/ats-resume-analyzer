import { Worker, type Job } from 'bullmq'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { redisClient } from '../config/redis.config'
import { analyzeFile } from '../controllers/helper/analyze/analyzeFile'
import { logger, prisma } from '../server'
import {
  createAnalyzeWorker,
  processAnalyzeJob,
  type AnalyzeJobData
} from './analyze.worker'

vi.mock('../server')

vi.mock('../config/redis.config', () => ({
  redisClient: { get: vi.fn(), del: vi.fn(), setex: vi.fn() },
  bullMqConnectionOptions: {}
}))

vi.mock('../controllers/helper/analyze/analyzeFile', () => ({
  analyzeFile: vi.fn()
}))

vi.mock('bullmq', () => ({ Worker: vi.fn() }))

const makeJob = (overrides: Partial<AnalyzeJobData> = {}) =>
  ({
    id: 'job-test-id',
    data: {
      extractedText: 'Resume text here',
      isPremium: false,
      userId: null,
      fileName: undefined,
      fileSize: undefined,
      ipAddress: undefined,
      userAgent: undefined,
      ...overrides
    }
  }) as unknown as Job<AnalyzeJobData>

describe('processAnalyzeJob — success (anonymous)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets status to PROCESSING then COMPLETED', async () => {
    const analysisResult = { id: 'analysis-id', score: 90 }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)

    await processAnalyzeJob(makeJob())

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
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)

    await processAnalyzeJob(makeJob({ isPremium: true }))

    expect(analyzeFile).toHaveBeenCalledWith('Resume text here', {
      premium: true
    })
  })

  it('stores result in Redis with correct key, TTL, and payload', async () => {
    const analysisResult = { id: 'analysis-id', score: 80 }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)

    await processAnalyzeJob(makeJob())

    expect(redisClient.setex).toHaveBeenCalledWith(
      'result:job-test-id',
      3600,
      JSON.stringify({
        ...analysisResult,
        parsed_file: 'Resume text here',
        user: null
      })
    )
  })

  it('does NOT call prisma.user.update when userId is null', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)

    await processAnalyzeJob(makeJob({ userId: null }))

    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})

describe('processAnalyzeJob — success (authenticated)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls prisma.user.update with requestLogs.create containing all fields', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(
      makeJob({
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

  it('stores user: { id: userId } in Redis result data', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(makeJob({ userId: 'user-123' }))

    const stored = JSON.parse(
      vi.mocked(redisClient.setex).mock.calls[0][2] as string
    )
    expect(stored.user).toEqual({ id: 'user-123' })
  })

  it('decodes fileName from latin1 to utf8 correctly', async () => {
    const analysisResult = { id: 'analysis-id' }
    vi.mocked(analyzeFile).mockResolvedValue(analysisResult as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    // Simulate latin1-encoded UTF-8 bytes for "résumé"
    const latin1Encoded = Buffer.from('résumé', 'utf8').toString('latin1')

    await processAnalyzeJob(
      makeJob({ userId: 'user-123', fileName: latin1Encoded })
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
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)
    vi.mocked(prisma.user.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(
      makeJob({ userId: 'user-123', fileName: undefined })
    )

    const call = vi.mocked(prisma.user.update).mock.calls[0][0] as {
      data: { requestLogs: { create: { fileName: string | null } } }
    }
    expect(call.data.requestLogs.create.fileName).toBeNull()
  })
})

describe('processAnalyzeJob — analyzeFile returns error', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets status to FAILED with error message', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(makeJob())

    expect(prisma.analysisJob.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'job-test-id' },
      data: { status: 'FAILED', error: 'AI failed' }
    })
  })

  it('does NOT call redisClient.setex', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(makeJob())

    expect(redisClient.setex).not.toHaveBeenCalled()
  })

  it('does NOT call prisma.user.update even with userId set', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(makeJob({ userId: 'user-123' }))

    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('calls analysisJob.update exactly twice (PROCESSING + FAILED)', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ error: 'AI failed' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await processAnalyzeJob(makeJob())

    expect(prisma.analysisJob.update).toHaveBeenCalledTimes(2)
  })
})

describe('processAnalyzeJob — requestLogs failure does not override COMPLETED', () => {
  beforeEach(() => vi.clearAllMocks())

  it('job remains COMPLETED when prisma.user.update throws', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ id: 'analysis-id' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB lost'))

    await processAnalyzeJob(makeJob({ userId: 'user-123' }))

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
    vi.mocked(redisClient.setex).mockResolvedValue('OK' as never)
    vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB lost'))

    await processAnalyzeJob(makeJob({ userId: 'user-123' }))

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ jobId: 'job-test-id' }),
      expect.stringContaining('analysis still completed')
    )
  })
})

describe('processAnalyzeJob — unexpected error sets FAILED and re-throws', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sets status FAILED and re-throws when analyzeFile throws unexpectedly', async () => {
    vi.mocked(analyzeFile).mockRejectedValue(new Error('Network error'))
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)

    await expect(processAnalyzeJob(makeJob())).rejects.toThrow('Network error')

    expect(prisma.analysisJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' })
      })
    )
  })

  it('sets status FAILED and re-throws when redisClient.setex throws', async () => {
    vi.mocked(analyzeFile).mockResolvedValue({ id: 'analysis-id' } as never)
    vi.mocked(prisma.analysisJob.update).mockResolvedValue(undefined as never)
    vi.mocked(redisClient.setex).mockRejectedValue(new Error('Redis OOM'))

    await expect(processAnalyzeJob(makeJob())).rejects.toThrow('Redis OOM')

    expect(prisma.analysisJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' })
      })
    )
  })
})

describe('createAnalyzeWorker — initialisation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls Worker constructor with correct queue name, processor, and options', () => {
    vi.mocked(Worker).mockImplementation(
      () => ({ on: vi.fn() }) as unknown as InstanceType<typeof Worker>
    )

    createAnalyzeWorker()

    expect(Worker).toHaveBeenCalledWith('analyze', processAnalyzeJob, {
      connection: {},
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 }
    })
  })

  it('returns the worker instance from the constructor', () => {
    const fakeWorker = { on: vi.fn() }
    vi.mocked(Worker).mockImplementation(
      () => fakeWorker as unknown as InstanceType<typeof Worker>
    )

    const result = createAnalyzeWorker()

    expect(result).toBe(fakeWorker)
  })
})

describe('createAnalyzeWorker — failed event listener', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registers a "failed" event handler on the worker', () => {
    const fakeWorker = { on: vi.fn() }
    vi.mocked(Worker).mockImplementation(
      () => fakeWorker as unknown as InstanceType<typeof Worker>
    )

    createAnalyzeWorker()

    expect(fakeWorker.on).toHaveBeenCalledWith('failed', expect.any(Function))
  })

  it('handler calls logger.error with jobId and err', () => {
    let capturedHandler:
      | ((job: { id: string } | undefined, err: Error) => void)
      | undefined
    const fakeWorker = {
      on: vi.fn((event, handler) => {
        if (event === 'failed') {
          capturedHandler = handler
        }
      })
    }
    vi.mocked(Worker).mockImplementation(
      () => fakeWorker as unknown as InstanceType<typeof Worker>
    )

    createAnalyzeWorker()

    const err = new Error('boom')
    capturedHandler?.({ id: 'job-abc' }, err)

    expect(logger.error).toHaveBeenCalledWith(
      { jobId: 'job-abc', err },
      'Analysis job failed unexpectedly'
    )
  })

  it('handler does not throw when job is undefined', () => {
    let capturedHandler: ((job: undefined, err: Error) => void) | undefined
    const fakeWorker = {
      on: vi.fn((event, handler) => {
        if (event === 'failed') {
          capturedHandler = handler
        }
      })
    }
    vi.mocked(Worker).mockImplementation(
      () => fakeWorker as unknown as InstanceType<typeof Worker>
    )

    createAnalyzeWorker()

    expect(() => capturedHandler?.(undefined, new Error('boom'))).not.toThrow()
  })
})
