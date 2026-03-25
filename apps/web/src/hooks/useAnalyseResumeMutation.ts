import { AnalyseResult, submitAnalyseResume } from '@/services/analyseService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import { useRef } from 'react'

type AnalyseMutationOptions = UseMutationOptions<AnalyseResult, AxiosError, File> & {
  onJobSubmitted?: (response: AxiosResponse<{ jobId: string }>) => void
}

export const useAnalyseResumeMutation = (
  options?: AnalyseMutationOptions
) => {
  const { isPremium, user } = useSessionStore()
  const abortControllerRef = useRef<AbortController | null>(null)

  const { onJobSubmitted, ...mutationOptions } = options ?? {}

  const mutation = useMutation<AnalyseResult, AxiosError, File>({
    mutationFn: (file: File) => {
      abortControllerRef.current = new AbortController()
      return submitAnalyseResume({
        file,
        isPremium,
        userId: user?.id,
        signal: abortControllerRef.current.signal,
        onJobSubmitted
      })
    },
    ...mutationOptions
  })

  const abort = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }

  return { ...mutation, abort }
}
