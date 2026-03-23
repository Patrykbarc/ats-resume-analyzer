import { deleteAccountService } from '@/services/authService'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'

export const useDeleteAccount = (
  options?: UseMutationOptions<AxiosResponse, AxiosError>
) => {
  return useMutation<AxiosResponse, AxiosError>({
    mutationFn: deleteAccountService,
    ...options
  })
}
