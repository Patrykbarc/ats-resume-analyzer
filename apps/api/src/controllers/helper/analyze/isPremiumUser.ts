import { UserSchemaType } from '@monorepo/schemas'
import { isAfter } from 'date-fns'

export const isPremiumUser = (user: UserSchemaType | undefined): boolean => {
  if (!user) {
    return false
  }

  if (!user.isPremium) {
    return false
  }

  if (!user.subscriptionCurrentPeriodEnd) {
    return false
  }

  return isAfter(user.subscriptionCurrentPeriodEnd, new Date())
}
