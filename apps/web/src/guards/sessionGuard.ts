import { QUERY_KEYS } from '@/constants/query-keys'
import { getCurrentUserService } from '@/services/authService'
import { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'

export async function sessionGuard({
  queryClient
}: {
  queryClient: QueryClient
}) {
  const response = await queryClient.ensureQueryData({
    queryKey: QUERY_KEYS.session.currentUser,
    queryFn: getCurrentUserService
  })

  if (!response?.id) {
    throw redirect({ to: '/login' })
  }
}
