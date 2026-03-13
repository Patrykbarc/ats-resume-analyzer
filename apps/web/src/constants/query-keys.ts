export const QUERY_KEYS = {
  session: {
    currentUser: ['currentUser'] as const,
    account: ['accountInformations'] as const
  },
  subscription: {
    user: ['userSubscription'] as const
  },
  stripe: {
    session: (sessionId: string) => ['stripeSession', sessionId] as const
  },
  analysis: {
    byId: (id: string) => ['analysis', id] as const,
    parsedFile: (id: string) => ['analysisParsedFile', id] as const,
    latestHistory: (userId: string) =>
      ['analysisLatestHistory', userId] as const,
    historyPage: (userId: string, page: number, limit: number) =>
      ['analysisHistoryPage', userId, page, limit] as const
  }
}
