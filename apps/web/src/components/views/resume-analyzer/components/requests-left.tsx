import { useRateLimit } from '@/hooks/useRateLimit'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { FREE_REQUESTS_PER_DAY } from '@monorepo/constants'
import { useTranslation } from 'react-i18next'

export function RequestsLeft() {
  const { t } = useTranslation('resumeAnalyzer')
  const { requestsLeft } = useRateLimit()
  const { isPremium, isLoading } = useSessionStore()

  if (isPremium || isLoading) {
    return null
  }

  if (requestsLeft !== 0) {
    return (
      <p className="text-center">
        {t('requestsLeft', {
          count: requestsLeft ?? FREE_REQUESTS_PER_DAY
        })}
      </p>
    )
  }

  return null
}
