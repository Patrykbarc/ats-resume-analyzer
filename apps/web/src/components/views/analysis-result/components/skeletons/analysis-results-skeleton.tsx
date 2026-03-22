import { Skeleton } from '@/components/ui/skeleton'

function AnalysisNavigationSkeleton() {
  return (
    <>
      <Skeleton className="h-6 pb-4 w-[70px]" />
      <Skeleton className="h-8 w-[183px]" />
    </>
  )
}

function AnalysisCardsSkeleton() {
  const commonClasses = 'h-[456px] md:h-64 w-full'

  return (
    <div className="space-y-6">
      <Skeleton className={commonClasses} />
      <Skeleton className={commonClasses} />
      <Skeleton className={commonClasses} />
      <Skeleton className={commonClasses} />
    </div>
  )
}

function AnalysisSkeletonWithNavigation() {
  return (
    <div className="space-y-6">
      <AnalysisNavigationSkeleton />
      <AnalysisCardsSkeleton />
    </div>
  )
}

export { AnalysisCardsSkeleton, AnalysisSkeletonWithNavigation }
