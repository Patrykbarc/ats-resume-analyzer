import {
  LoginUserSchema,
  RegisterUserSchema,
  ResendEmailValidationSchema,
  ResetPasswordSchema,
  VerifyUserSchema
} from '@monorepo/schemas'
import { Router } from 'express'
import { authAttemptLimiter } from '../config/limiter.config'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  requestPasswordReset,
  resendVerificationLink,
  resetPassword,
  verifyUser
} from '../controllers/auth.controller'
import { requireAuth } from '../middleware/require-auth.middleware'
import { validateData } from '../middleware/validate-entries.middleware'

const router: Router = Router()

router.post(
  '/login',
  validateData(LoginUserSchema),
  authAttemptLimiter,
  loginUser
)
router.post(
  '/register',
  validateData(RegisterUserSchema),
  authAttemptLimiter,
  registerUser
)
router.post('/refresh', validateData(VerifyUserSchema), refreshToken)
router.post('/verify', validateData(VerifyUserSchema), verifyUser)
router.post(
  '/verify/resend',
  validateData(VerifyUserSchema),
  resendVerificationLink
)
router.post(
  '/password/request-reset',
  validateData(ResendEmailValidationSchema),
  authAttemptLimiter,
  requestPasswordReset
)
router.post('/password/reset', validateData(ResetPasswordSchema), resetPassword)
router.post('/logout', logoutUser)
router.get('/me', requireAuth, getCurrentUser)

export default router
