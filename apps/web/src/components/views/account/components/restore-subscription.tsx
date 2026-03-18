import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { QUERY_KEYS } from '@/constants/query-keys'
import { useRestoreSubscription } from '@/hooks/checkout/useRestoreSubscription'
import { cn } from '@/lib/utils'
import { User } from '@monorepo/database'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export function RestoreSubscription({
  id,
  className
}: {
  id: User['id']
  className?: string
}) {
  const queryClient = useQueryClient()

  const { isPending, mutate } = useRestoreSubscription({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.account
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.currentUser
      })
    },
    onError: () => {
      toast.error('Failed to restore subscription. Please try again.')
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger className={className} asChild>
        <Button
          variant="default"
          size="sm"
          className="w-fit md:ml-auto"
          disabled={isPending}
        >
          Restore subscription
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-destructive" />
            <AlertDialogTitle>Restore subscription</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <span>
              Are you sure you want to restore your Premium subscription?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={cn(buttonVariants({ variant: 'secondary' }))}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'default' }))}
            onClick={() => mutate({ id })}
          >
            Yes, restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
