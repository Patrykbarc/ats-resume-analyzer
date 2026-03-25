const FREE_REQUESTS_PER_DAY = 2

const HEADERS = {
  'X-RateLimit-Limit': 'X-RateLimit-Limit',
  'X-RateLimit-Remaining': 'X-RateLimit-Remaining',
  'X-RateLimit-Reset': 'X-RateLimit-Reset'
} as const

export { FREE_REQUESTS_PER_DAY, HEADERS }
