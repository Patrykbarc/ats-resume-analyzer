import { AuthPage } from '@/components/views/auth/auth-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthPage
})
