import { QUERY_KEYS } from '@/constants/query-keys'
import { getAnalysisHistory } from '@/services/analyseService'
import { AnalysisParamsWithLimit } from '@monorepo/schemas'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import { AnalysisHistoryResponse } from './types/types'

type AnalysisHistoryKeyType = 'latestHistory' | 'historyPage'

type UseGetAnalysisHistoryParams = AnalysisParamsWithLimit & {
  keyType: AnalysisHistoryKeyType
}

const analysisOptions = ({
  id,
  limit,
  page,
  keyType
}: UseGetAnalysisHistoryParams) => {
  const queryKey =
    keyType === 'historyPage' && page && limit
      ? QUERY_KEYS.analysis.historyPage(id, page, limit)
      : QUERY_KEYS.analysis.latestHistory(id)

  return queryOptions<
    AxiosResponse<AnalysisHistoryResponse> | null,
    AxiosError
  >({
    queryKey,
    queryFn: () => getAnalysisHistory({ id, limit, page }),
    enabled: !!id
  })
}

export const useGetAnalysisHistory = (params: UseGetAnalysisHistoryParams) => {
  return useQuery(analysisOptions(params))
}
