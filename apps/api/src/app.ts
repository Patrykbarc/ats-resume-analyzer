import express, { type Express } from 'express'
import appMiddleware from './middleware/app.middleware'

const app: Express = express()

appMiddleware(app)

export default app
