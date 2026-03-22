import { CircleCheckIcon, CircleXIcon } from 'lucide-react'
import { ReactNode } from 'react'

export function VerificationStatus({
  message,
  icon,
  children
}: {
  message: string
  icon?: 'SUCCESS' | 'ERROR'
  children?: ReactNode
}) {
  return (
    <div className="text-center">
      {icon && (
        <div className="flex justify-center mb-4">
          {icon === 'ERROR' ? (
            <CircleXIcon className="text-rose-400 size-12" />
          ) : (
            <CircleCheckIcon className="text-green-400 size-12" />
          )}
        </div>
      )}
      <p>{message}</p>

      {children}
    </div>
  )
}
