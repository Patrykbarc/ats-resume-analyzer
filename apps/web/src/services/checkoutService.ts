import { apiClient } from '@/api/apiClient'
import {
  BuyerId,
  StripeSessionId,
  StripeSessionUrl
} from '@/hooks/checkout/types/types'
import { UserId } from '@/hooks/checkout/useCancelSubscription'
import { AxiosResponse } from 'axios'

export const handleBuyPremium = async (user: BuyerId) => {
  const userId = user.id

  const response = await apiClient.post<StripeSessionUrl>(
    '/checkout/create-checkout-session',
    {
      id: userId
    }
  )

  return response.data
}

export const verifyStripeSession = async (sessionId: string) => {
  const response = await apiClient<StripeSessionId>(
    '/checkout/verify-payment',
    {
      params: { id: sessionId }
    }
  )

  return response.data
}

export const cancelSubscriptionService = async (user: UserId) => {
  const response = await apiClient.post<AxiosResponse>(
    '/checkout/cancel-subscription',
    {
      id: user.id
    }
  )

  return response
}

export const restoreSubscriptionService = async (user: UserId) => {
  const response = await apiClient.post<AxiosResponse>(
    '/checkout/restore-subscription',
    { id: user.id }
  )

  return response
}

export const getInvoicesService = async () => {
  const response = await apiClient.get<{ invoices: Invoice[] }>(
    '/checkout/invoices'
  )
  return response.data.invoices
}

export type Invoice = {
  id: string
  number: string | null
  date: number
  amount: number
  currency: string
  status: string | null
  pdfUrl: string | null
}
