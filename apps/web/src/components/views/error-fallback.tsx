import { cn } from '@/lib/utils'
import { buttonVariants } from '../ui/button'

type Props = {
  resetError: () => void
}

export function ErrorFallback({ resetError }: Props) {
  return (
    <div className="grid h-full items-center pb-18">
      <div>
        <div className="mb-8 text-center">
          <p className="text-9xl font-bold text-accent mb-4">!</p>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-lg text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={resetError}
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            Try again
          </button>
          <a
            href="/"
            className={cn(buttonVariants({ variant: 'default', size: 'lg' }))}
          >
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
