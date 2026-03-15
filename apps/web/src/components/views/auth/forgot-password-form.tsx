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
import { AuthErrorMessages } from './components/auth-error-messages'
import { FieldSuccess } from './components/field-success'
import { AuthFormFields } from './types/types'

const FORM_FIELDS: AuthFormFields<ResendEmailValidationSchemaType>[] = [
  {
    fieldName: 'email',
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email'
  }
]

export function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { mutate, isPending, isSuccess, error } = useRequestPasswordReset({
    onSuccess: () => {
      setSuccessMessage(
        'If an account with that email exists, a password reset link has been sent.'
      )
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
        Reset password
      </Button>

      {successMessage && <FieldSuccess message={successMessage} />}
      {error && <AuthErrorMessages error={error} />}
    </form>
  )
}
