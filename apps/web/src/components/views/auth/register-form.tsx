import { Button } from '@/components/ui/button'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useRegisterMutation } from '@/hooks/useRegisterMutation'
import { RegisterUserSchema, RegisterUserSchemaType } from '@monorepo/schemas'
import { sentryLogger } from '@monorepo/sentry-logger'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import { AuthErrorMessages } from './components/auth-error-messages'
import { AuthFormFields } from './types/types'

export function RegisterForm() {
  const { t } = useTranslation('auth')

  const FORM_FIELDS: AuthFormFields<RegisterUserSchemaType>[] = [
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
    },
    {
      fieldName: 'confirmPassword',
      label: t('fields.confirmPassword'),
      placeholder: t('fields.passwordPlaceholder'),
      type: 'password'
    }
  ]

  const { mutate, isPending, isSuccess, error } = useRegisterMutation({
    onError: (err) => {
      sentryLogger.unexpected(err)
    }
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validators: {
      onSubmit: RegisterUserSchema
    },
    onSubmit: async ({ value }) => {
      mutate(value)
    }
  })

  const emailAddress = form.state.values['email']

  if (isSuccess) {
    return (
      <>
        <hr className="mb-8" />
        <CardHeader className="text-center">
          <CardTitle>{t('register.successTitle')}</CardTitle>
          <CardDescription>
            {t('register.successDescription', { email: emailAddress })}
          </CardDescription>
        </CardHeader>
      </>
    )
  }

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
                      disabled={isPending}
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

      <Button type="submit" disabled={isPending}>
        {t('register.submit')}
      </Button>

      {error && <AuthErrorMessages error={error} />}
    </form>
  )
}
