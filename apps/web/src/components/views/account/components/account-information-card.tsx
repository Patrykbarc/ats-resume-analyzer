import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { User } from '@monorepo/database'
import { format } from 'date-fns'
import { UserIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DeleteAccount } from './delete-account'

type AccountInformationCardProps = {
  email: User['email']
  createdAt: User['createdAt']
}

export function AccountInformationCard({
  email,
  createdAt
}: AccountInformationCardProps) {
  const { t } = useTranslation('account')
  const createdAtFormatted = format(new Date(createdAt), 'MMMM dd, yyyy')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserIcon className="size-5 text-primary" />
          <CardTitle>{t('information.title')}</CardTitle>
        </div>
        <CardDescription>{t('information.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('information.email')}
            </p>
            <p className="text-base text-foreground">{email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('information.memberSince')}
            </p>
            <p className="text-base text-foreground">{createdAtFormatted}</p>
          </div>
        </div>
        <DeleteAccount />
      </CardContent>
    </Card>
  )
}
