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
import { useCancelSubscription } from '@/hooks/checkout/useCancelSubscription'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { UserBillingInformation } from '../types/types'

export function CancelSubscription({
  id,
  nextBillingDate,
  className
}: UserBillingInformation) {
  const queryClient = useQueryClient()

  const { isPending, mutate } = useCancelSubscription({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.account
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session.currentUser
      })
    },
    onError: () => {
      toast.error('Failed to cancel subscription. Please try again.')
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger className={className} asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-fit md:ml-auto"
          disabled={isPending}
        >
          Cancel subscription
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center items-center gap-2 mb-2">
            <AlertTriangle className="size-5 text-destructive" />
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <span>
              Are you sure you want to cancel your Premium subscription?
              <br />
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              Your subscription will remain active until {nextBillingDate}.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={cn(
              buttonVariants({ variant: 'default' }),
              'hover:text-white'
            )}
          >
            Keep subscription
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'secondary' })}
            onClick={() => mutate({ id })}
          >
            Yes, cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
