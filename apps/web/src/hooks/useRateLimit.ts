import { fromUnixTime, isAfter, isValid } from 'date-fns'
import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export const REQUESTS_LEFT_KEY = 'requestsLeft'
export const REQUESTS_COOLDOWN_KEY = 'requestsCooldown'

export const useRateLimit = () => {
  const [requestsLeft, setRequestsLeft] = useLocalStorage<number | null>(
    REQUESTS_LEFT_KEY,
    null
  )
  const [requestsCooldown, setRequestsCooldownRaw] = useLocalStorage<
    string | null
  >(REQUESTS_COOLDOWN_KEY, null)

  const cooldownDate = useMemo(() => {
    if (!requestsCooldown) {
      return null
    }

    const timestamp = Number(requestsCooldown)
    const date = isNaN(timestamp)
      ? new Date(requestsCooldown)
      : fromUnixTime(timestamp)
    return isValid(date) ? date : null
  }, [requestsCooldown])

  const isCooldownActive = useMemo(() => {
    if (!cooldownDate) {
      return false
    }
    return isAfter(cooldownDate, new Date())
  }, [cooldownDate])

  useEffect(() => {
    if (requestsCooldown && !isCooldownActive) {
      setRequestsCooldownRaw(null)
      setRequestsLeft(null)
    }
  }, [
    requestsCooldown,
    isCooldownActive,
    setRequestsCooldownRaw,
    setRequestsLeft
  ])

  const setRequestsCooldown = useCallback(
    (value: string | null) => {
      setRequestsCooldownRaw(value)
    },
    [setRequestsCooldownRaw]
  )

  return {
    requestsLeft,
    setRequestsLeft,
    requestsCooldown,
    cooldownDate,
    isCooldownActive,
    setRequestsCooldown
  }
}
