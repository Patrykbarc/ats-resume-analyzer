import { QUERY_KEYS } from '@/constants/query-keys'
import { verifyStripeSession } from '@/services/checkoutService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { useQuery } from '@tanstack/react-query'

const FIVE_MINUTES = 5 * 60 * 1000

export const useVerifyStripeSession = (sessionId: string) => {
  const { isLoading: isAuthLoading } = useSessionStore()

  return useQuery({
    queryKey: QUERY_KEYS.stripe.session(sessionId),
    queryFn: () => verifyStripeSession(sessionId),
    enabled: !!sessionId && !isAuthLoading,
    staleTime: FIVE_MINUTES
  })
}
