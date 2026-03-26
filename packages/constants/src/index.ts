const FREE_REQUESTS_PER_DAY = 2

const HEADERS = {
  'X-RateLimit-Limit': 'x-ratelimit-limit',
  'X-RateLimit-Remaining': 'x-ratelimit-remaining',
  'X-RateLimit-Reset': 'x-ratelimit-reset'
} as const

export { FREE_REQUESTS_PER_DAY, HEADERS }
