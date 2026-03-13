import { apiClient } from '@/api/apiClient'
import type { User } from '@monorepo/database'
import { AnalysisParamsWithLimit, UserSchemaType } from '@monorepo/schemas'
import type { AiAnalysis } from '@monorepo/types'
import { AxiosResponse } from 'axios'

export type AnalysisDetails = AiAnalysis & {
  user?: Pick<UserSchemaType, 'id'> | null
}

export type ParsedFileResponse = {
  status: number
  parsed_file: string
}

export type AnalyseResult = AxiosResponse<AnalysisDetails>

export const submitAnalyseResume = async ({
  file,
  isPremium,
  userId
}: {
  file: File
  isPremium: boolean
  userId?: User['id']
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

  const response = await apiClient.post<AiAnalysis>(route(), formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response
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
  page
}: AnalysisParamsWithLimit) => {
  if (!id) {
    return null
  }

  const response = await apiClient(`/cv/analysis-history/${id}`, {
    params: { limit, page }
  })

  return response
}
