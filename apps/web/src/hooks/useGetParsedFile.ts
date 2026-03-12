import { QUERY_KEYS } from '@/constants/query-keys'
import { getParsedFile, ParsedFileResponse } from '@/services/analyseService'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const useGetParsedFile = (id: string, isOwner: boolean) => {
  return useQuery(
    queryOptions<ParsedFileResponse, AxiosError>({
      queryKey: QUERY_KEYS.analysis.parsedFile(id),
      queryFn: () => getParsedFile(id),
      enabled: isOwner
    })
  )
}
