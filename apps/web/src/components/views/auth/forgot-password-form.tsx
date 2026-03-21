import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useRequestPasswordReset } from '@/hooks/useRequestPasswordReset'
import {
  ResendEmailValidationSchema,
  ResendEmailValidationSchemaType
} from '@monorepo/schemas'
import { sentryLogger } from '@monorepo/sentry-logger'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthErrorMessages } from './components/auth-error-messages'
import { FieldSuccess } from './components/field-success'
import { AuthFormFields } from './types/types'

export function ForgotPasswordForm() {
  const { t } = useTranslation('auth')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const FORM_FIELDS: AuthFormFields<ResendEmailValidationSchemaType>[] = [
    {
      fieldName: 'email',
      label: t('fields.email'),
      placeholder: t('fields.emailPlaceholder'),
      type: 'email'
    }
  ]

  const { mutate, isPending, isSuccess, error } = useRequestPasswordReset({
    onSuccess: () => {
      setSuccessMessage(t('forgotPassword.successMessage'))
    },
    onError: (err) => {
      sentryLogger.unexpected(err)
    }
  })

  const form = useForm({
    defaultValues: {
      email: ''
    },
    validators: {
      onSubmit: ResendEmailValidationSchema
    },
    onSubmit: async ({ value }) => {
      mutate(value.email)
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

      <Button type="submit" disabled={isPending}>
        {t('forgotPassword.submit')}
      </Button>

      {successMessage && <FieldSuccess message={successMessage} />}
      {error && <AuthErrorMessages error={error} />}
    </form>
  )
}
