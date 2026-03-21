import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useLoginMutation } from '@/hooks/useLoginMutation'
import { getCurrentUserService } from '@/services/authService'
import { useSessionStore } from '@/stores/session/useSessionStore'
import { LoginUserSchema, LoginUserSchemaType } from '@monorepo/schemas'
import { sentryLogger } from '@monorepo/sentry-logger'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { AuthErrorMessages } from './components/auth-error-messages'
import { AuthFormFields } from './types/types'

export function LoginForm() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const { redirect } = useSearch({ from: '/_auth/login/' })
  const queryClient = useQueryClient()
  const { setAuthToken, setUser, setIsUserLoggedIn, setIsPremium } =
    useSessionStore()

  const FORM_FIELDS: AuthFormFields<LoginUserSchemaType>[] = [
    {
      fieldName: 'email',
      label: t('fields.email'),
      placeholder: t('fields.emailPlaceholder'),
      type: 'email'
    },
    {
      fieldName: 'password',
      label: t('fields.password'),
      placeholder: t('fields.passwordPlaceholder'),
      type: 'password'
    }
  ]

  const { mutate, isPending, isSuccess, error } = useLoginMutation({
    onSuccess: async (response) => {
      const token = response.data.token
      setAuthToken(token)

      const userData = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.session.currentUser,
        queryFn: getCurrentUserService
      })

      if (userData) {
        setUser(userData)
        setIsUserLoggedIn(true)
        setIsPremium(userData.isPremium)
      }

      toast.success(t('login.successToast'))
      navigate({ to: redirect ?? '/' })
    },
    onError: (err) => {
      sentryLogger.unexpected(err)
    }
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    validators: {
      onSubmit: LoginUserSchema
    },
    onSubmit: async ({ value }) => {
      mutate(value)
    }
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4 relative z-10"
    >
      <FieldGroup>
        {FORM_FIELDS.map((item) => {
          return (
            <form.Field
              key={item.fieldName}
              name={item.fieldName}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={item.placeholder}
                      disabled={isPending || isSuccess}
                      type={item.type}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          )
        })}
      </FieldGroup>

      <div className="flex justify-between items-center">
        <Button type="submit" disabled={isPending}>
          {t('login.submit')}
        </Button>

        <Link to="/forgot-password" className="text-sm underline">
          {t('login.forgotPassword')}
        </Link>
      </div>

      {error && <AuthErrorMessages error={error} />}
    </form>
  )
}
