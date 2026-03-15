import { AnalyseResult, submitAnalyseResume } from '@/services/analyseService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useRef } from 'react'

export const useAnalyseResumeMutation = (
  options?: UseMutationOptions<AnalyseResult, AxiosError, File>
) => {
  const { isPremium, user } = useSessionStore()
  const abortControllerRef = useRef<AbortController | null>(null)

  const mutation = useMutation<AnalyseResult, AxiosError, File>({
    mutationFn: (file: File) => {
      abortControllerRef.current = new AbortController()
      return submitAnalyseResume({
        file,
        isPremium,
        userId: user?.id,
        signal: abortControllerRef.current.signal
      })
    },
    ...options
  })

  const abort = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }

  return { ...mutation, abort }
}
