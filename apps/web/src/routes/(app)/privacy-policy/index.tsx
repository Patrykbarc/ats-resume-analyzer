import { PrivacyPolicyPage } from '@/components/views/privacy-policy/privacy-policy'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/privacy-policy/')({
  component: PrivacyPolicyPage
})
