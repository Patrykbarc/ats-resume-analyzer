import {
  AnalysisParamsSchema,
  AnalysisParamsWithPaginationSchema,
  FileSchema
} from '@monorepo/schemas'
import { Router } from 'express'
import multer from 'multer'
import { analyzeLimiter, userAnalyzeLimiter } from '../config/limiter.config'
import {
  createAnalyze,
  getAnalysis,
  getAnalysisHistory,
  getJobStatus,
  getParsedFile
} from '../controllers/analyse.controller'
import { requireAuth } from '../middleware/require-auth.middleware'
import { requirePremium } from '../middleware/require-premium.middleware'
import {
  validateData,
  validateFile
} from '../middleware/validate-entries.middleware'

const upload = multer({ storage: multer.memoryStorage() })
const multipartParser = upload.single('file')

const router: Router = Router()

router.post(
  '/analyze/free',
  analyzeLimiter,
  multipartParser,
  validateFile(FileSchema),
  createAnalyze
)
router.post(
  '/analyze/signed-in',
  requireAuth,
  userAnalyzeLimiter,
  multipartParser,
  validateFile(FileSchema),
  createAnalyze
)
router.post(
  '/analyze/premium',
  requireAuth,
  requirePremium,
  userAnalyzeLimiter,
  multipartParser,
  validateFile(FileSchema),
  createAnalyze
)

router.get('/analyze/job/:jobId', getJobStatus)

router.get('/analysis/:id', validateData(AnalysisParamsSchema), getAnalysis)
router.get(
  '/analysis/:id/parsed-file',
  requireAuth,
  validateData(AnalysisParamsSchema),
  getParsedFile
)

router.get(
  '/analysis-history/:id',
  validateData(AnalysisParamsWithPaginationSchema),
  getAnalysisHistory
)

export default router
