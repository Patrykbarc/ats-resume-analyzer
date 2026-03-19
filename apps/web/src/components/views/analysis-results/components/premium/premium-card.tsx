import { Card, CardContent } from '@/components/ui/card'
import type { PropsWithChildren, ReactNode } from 'react'

type PremiumCardProps = {
  title: string
  description?: string
  actions?: ReactNode
}

export function PremiumCard({
  title,
  description,
  actions,
  children
}: PropsWithChildren<PremiumCardProps>) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
