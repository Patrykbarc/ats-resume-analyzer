import { PrismaClient } from '@monorepo/database'
import axios, { isAxiosError } from 'axios'
import { StatusCodes } from 'http-status-codes'
import OpenAI from 'openai'
import pino from 'pino'
import app from './app'
import pinoConfig from './config/pino.config'
import './config/sentry.config'
import config from './config/server.config'
import { getEnvs } from './lib/getEnv'

const { OPENAI_API_KEY, DATABASE_URL } = getEnvs()

export const logger = pino({ ...pinoConfig })
export const openAiClient = new OpenAI({ apiKey: OPENAI_API_KEY })
export const prisma = new PrismaClient({
  datasourceUrl: DATABASE_URL
})

app.set('trust proxy', 'loopback, linklocal, uniquelocal')

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection — shutting down')
  process.exit(1)
})

const server = app.listen(config.port, async () => {
  const apiUrl = `http://localhost:${config.port}`

  try {
    const healthCheckUrl = `${apiUrl}/health`
    const res = await axios(healthCheckUrl)

    if (res.status === StatusCodes.OK) {
      logger.info(`Server running on http://localhost:${config.port}`)
    } else {
      logger.error(
        `Server responded to /health with a non-OK status code. ${{
          status: res.status,
          url: healthCheckUrl
        }}`
      )
    }
  } catch (err) {
    if (isAxiosError(err)) {
      logger.fatal(
        `${err.status} ${err.code}: Health check failed due to connection error or exception.`
      )
    } else {
      logger.fatal(`An unknown error occured. ${err}`)
    }
  }
})

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown`)

  server.close(async () => {
    logger.info('HTTP server closed')

    try {
      await prisma.$disconnect()
      logger.info('Database connection closed')
      process.exit(0)
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown')
      process.exit(1)
    }
  })

  setTimeout(() => {
    logger.error('Graceful shutdown timeout, forcing exit')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
