import { queryClient } from '@/api/queryClient'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useAnalyseResumeMutation } from '@/hooks/useAnalyseResumeMutation'
import { useRateLimit } from '@/hooks/useRateLimit'
import {
  getHeadersRateLimitRemaining,
  getHeadersRateLimitReset,
  isRateLimitError
} from '@/lib/rateLimits'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { FileSchemaInput } from '@monorepo/schemas'
import { sentryLogger } from '@monorepo/sentry-logger'
import { useNavigate } from '@tanstack/react-router'
import { AxiosResponse, isAxiosError } from 'axios'
import { ChangeEvent, useCallback, useState } from 'react'

export const useAnalyzer = () => {
  const navigate = useNavigate()
  const { user } = useSessionStore()
  const [file, setFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const { setRequestsLeft, setRequestsCooldown } = useRateLimit()

  const { mutate, isPending, abort } = useAnalyseResumeMutation({
    onJobSubmitted: (response) => {
      updateRequestLimit(response)
    },
    onSuccess: (response) => {
      setValidationError(null)
      setMutationError(null)

      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.analysis.latestHistory(user?.id)
        })
      }

      navigate({ to: `/analyse/${response.data.id}` })
    },
    onError: (err) => {
      if (isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return
      }

      if (isAxiosError(err) && isRateLimitError(err)) {
        const timestamp = getHeadersRateLimitReset(err.response)
        const cooldown =
          timestamp ??
          String(Math.ceil((Date.now() + 24 * 60 * 60 * 1000) / 1000))
        setRequestsCooldown(cooldown)
        setRequestsLeft(0)
        sentryLogger.expected(err, { context: 'rate limit during analysis' })
        return
      }

      sentryLogger.unexpected(err, { context: 'analysis mutation error' })

      setMutationError('Something went wrong. Please try again.')
    }
  })

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (selectedFile) {
      setFile(selectedFile)
      setValidationError(null)
    }
  }, [])

  const handleAnalyse = useCallback(() => {
    if (!file) {
      return
    }

    const { success, error: validationError } = FileSchemaInput.safeParse(file)

    if (!success) {
      setValidationError(validationError.issues[0].message)
      return
    }

    setValidationError(null)
    mutate(file)
  }, [file, mutate])

  const handleReset = useCallback(() => {
    abort()
    setFile(null)
    setValidationError(null)
    setMutationError(null)
  }, [abort])

  const updateRequestLimit = useCallback(
    (response: AxiosResponse) => {
      const remaining = getHeadersRateLimitRemaining(response)
      const timestamp = getHeadersRateLimitReset(response)

      if (remaining !== null) {
        setRequestsLeft(remaining)
      }
      if (remaining === 0 && timestamp) {
        setRequestsCooldown(timestamp)
      }
    },
    [setRequestsCooldown, setRequestsLeft]
  )

  return {
    file,
    handleAnalyse,
    handleFileChange,
    handleReset,
    validationError,
    mutationError,
    isPending
  }
}
