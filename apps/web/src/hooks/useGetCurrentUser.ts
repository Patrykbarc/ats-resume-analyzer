import { getToken } from '@/api/tokenStorage'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getCurrentUserService } from '@/services/authService'
import { UserSchemaType } from '@monorepo/schemas'
import { useQuery } from '@tanstack/react-query'

const FIVE_MINUTES = 5 * 60 * 1000

export type CurrentUser = Pick<UserSchemaType, 'id' | 'email' | 'isPremium'>

export const useGetCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery<CurrentUser | null>({
    queryKey: QUERY_KEYS.session.currentUser,
    queryFn: getCurrentUserService,
    retry: false,
    staleTime: FIVE_MINUTES,
    enabled: options?.enabled ?? !!getToken()
  })
}
