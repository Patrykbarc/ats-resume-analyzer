import { z } from 'zod'

const PasswordLoginSchema = z
  .string()
  .min(1, { message: 'Please enter a password' })
  .min(6, { message: 'Password must be at least 6 characters' })

const RegisterPasswordSchema = PasswordLoginSchema.min(8, {
  message: 'Password must be at least 8 characters'
})
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter'
  })
  .regex(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter'
  })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' })

const RegisterUserBaseSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: 'Please enter an email address'
    })
    .pipe(
      z.email({
        message: 'Invalid email format'
      })
    ),
  password: RegisterPasswordSchema,
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' })
})

const RegisterUserSchema = RegisterUserBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword']
  }
)

const VerifyUserSchema = z.object({
  token: z.string().optional()
})

const ResendEmailValidationSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter an email address' })
    .pipe(z.email({ message: 'Invalid email format' }))
})

const ResetPasswordSchema = RegisterUserBaseSchema.omit({ email: true }).extend({
  token: z.string().min(1, { message: 'Token is required' })
})

const LoginUserSchema = RegisterUserBaseSchema.pick({ email: true }).extend({
  password: PasswordLoginSchema
})

const LoginSearchSchema = z.object({
  redirect: z.string().optional()
})

type LoginSearchSchemaType = z.infer<typeof LoginSearchSchema>

const SubscriptionStatus = [
  'active',
  'past_due',
  'trialing',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
] as const

const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.date(),
  isPremium: z.boolean(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  subscriptionStatus: z.enum(SubscriptionStatus).nullable(),
  subscriptionStartedAt: z.date().nullable(),
  subscriptionCurrentPeriodEnd: z.date().nullable(),
  cancelAtPeriodEnd: z.boolean()
})

type RegisterUserSchemaType = z.infer<typeof RegisterUserSchema>
type LoginUserSchemaType = z.infer<typeof LoginUserSchema>
type VerifyUserSchemaType = z.infer<typeof VerifyUserSchema>
type UserSchemaType = z.infer<typeof UserSchema>
type ResendEmailValidationSchemaType = z.infer<
  typeof ResendEmailValidationSchema
>
type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>

export {
  LoginSearchSchema,
  LoginUserSchema,
  RegisterUserSchema,
  ResendEmailValidationSchema,
  ResetPasswordSchema,
  UserSchema,
  VerifyUserSchema,
  type LoginSearchSchemaType,
  type LoginUserSchemaType,
  type RegisterUserSchemaType,
  type ResendEmailValidationSchemaType,
  type ResetPasswordSchemaType,
  type UserSchemaType,
  type VerifyUserSchemaType
}
