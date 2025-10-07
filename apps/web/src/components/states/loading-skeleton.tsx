import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">

      <main className="px-4 pt-4 space-y-4">
        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="flex-1 h-12 rounded-2xl" />
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>

        {/* Hero Slider Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-3xl" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-2 w-8 rounded-full" />
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>
        </div>

        {/* Category Filter Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        {/* Listing Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-3xl overflow-hidden border border-border">
              <Skeleton className="h-52 rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
