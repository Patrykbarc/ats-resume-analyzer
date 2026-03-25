import { apiClient } from '@/api/apiClient'
import type { User } from '@monorepo/database'
import { AnalysisParamsWithLimit, UserSchemaType } from '@monorepo/schemas'
import type { AiAnalysis } from '@monorepo/types'
import { AxiosResponse } from 'axios'

export type AnalysisDetails = AiAnalysis & {
  user?: Pick<UserSchemaType, 'id'> | null
  parsed_file?: string
}

export type ParsedFileResponse = {
  status: number
  parsed_file: string
}

export type AnalyseResult = AxiosResponse<AnalysisDetails>

type JobStatusResponse =
  | { status: 'PENDING' | 'PROCESSING' }
  | { status: 'FAILED'; error: string }
  | { status: 'COMPLETED'; result: AnalysisDetails }

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 60

export const pollJobResult = async (
  jobId: string,
  signal?: AbortSignal
): Promise<AnalysisDetails> => {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const response = await apiClient.get<JobStatusResponse>(
      `/cv/analyze/job/${jobId}`,
      { signal }
    )

    const data = response.data

    if (data.status === 'COMPLETED') {
      return data.result
    }

    if (data.status === 'FAILED') {
      throw new Error(data.error || 'Analysis failed')
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, POLL_INTERVAL_MS)
      signal?.addEventListener('abort', () => {
        clearTimeout(timeout)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })
  }

  throw new Error('Analysis timed out. Please try again.')
}

export const submitAnalyseResume = async ({
  file,
  isPremium,
  userId,
  signal,
  onJobSubmitted
}: {
  file: File
  isPremium: boolean
  userId?: User['id']
  signal?: AbortSignal
  onJobSubmitted?: (response: AxiosResponse<{ jobId: string }>) => void
}): Promise<AnalyseResult> => {
  const formData = new FormData()
  formData.append('file', file)

  const route = () => {
    if (isPremium) {
      return '/cv/analyze/premium'
    }

    if (userId && !isPremium) {
      return '/cv/analyze/signed-in'
    }

    return '/cv/analyze/free'
  }

  const submitResponse = await apiClient.post<{ jobId: string }>(
    route(),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      signal
    }
  )

  onJobSubmitted?.(submitResponse)

  const { jobId } = submitResponse.data
  const result = await pollJobResult(jobId, signal)

  return { ...submitResponse, data: result }
}

export const getAnalysis = async (id: string) => {
  const response = await apiClient<AnalysisDetails>(`/cv/analysis/${id}`)

  return response
}

export const getParsedFile = async (
  id: string
): Promise<ParsedFileResponse> => {
  const response = await apiClient.get<ParsedFileResponse>(
    `/cv/analysis/${id}/parsed-file`
  )
  return response.data
}

export const getAnalysisHistory = async ({
  id,
  limit,
  cursor
}: AnalysisParamsWithLimit) => {
  if (!id) {
    return null
  }

  const response = await apiClient(`/cv/analysis-history/${id}`, {
    params: { limit, cursor }
  })

  return response
}
