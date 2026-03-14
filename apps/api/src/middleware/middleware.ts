import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Application } from 'express'
import express from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import { corsOptions } from '../config/cors.config'
import { routes } from '../routes/routes'
import { middlewareErrorHandler } from './error-handler.middleware'

const middleware = (app: Application) => {
  app.use(helmet())
  app.use(cors(corsOptions))
  app.use(logger('dev'))

  app.use(cookieParser())

  app.use((req, res, next) => {
    if (req.path === '/api/checkout/checkout-session-webhook') {
      next()
    }

    express.json()(req, res, next)
  })

  routes(app)

  app.use(middlewareErrorHandler)
}

export default middleware
