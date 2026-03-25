import { HEADERS } from '@monorepo/constants'
import { getEnvs } from '../lib/getEnv'

const exposedHeaders = [...Object.values(HEADERS)]

const { FRONTEND_URL } = getEnvs()

export const corsOptions = {
  origin: FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders
}
