import { QUERY_KEYS } from '@/constants/query-keys'
import { getInvoicesService } from '@/services/checkoutService'
import { useQuery } from '@tanstack/react-query'

export function useInvoices() {
  return useQuery({
    queryKey: QUERY_KEYS.stripe.invoices,
    queryFn: getInvoicesService
  })
}
