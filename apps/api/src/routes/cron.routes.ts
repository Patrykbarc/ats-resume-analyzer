import { Router } from 'express'
import { keepDbAlive } from '../controllers/keep-db-alive.controller'
import { requireCronKey } from '../middleware/require-cron-key.middleware'

const router: Router = Router()

router.get('/keep-alive', requireCronKey, keepDbAlive)

export default router
