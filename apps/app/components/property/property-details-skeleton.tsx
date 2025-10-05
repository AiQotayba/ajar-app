import { Header } from "@/components/layout/header"

export function PropertyDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24 animate-pulse">
      <Header title="تفاصيل العقار" showBack showNotifications />

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Gallery Skeleton */}
        <div className="space-y-3">
          <div className="h-80 bg-muted rounded-3xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-muted rounded-2xl" />
            ))}
            <div className="w-20 h-20 bg-muted rounded-2xl" />
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded-lg w-3/4" />
          <div className="h-8 bg-muted rounded-lg w-1/3" />
          <div className="flex gap-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-muted rounded w-20" />
            ))}
          </div>
        </div>

        {/* Features Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-20" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted rounded-full w-24" />
            ))}
          </div>
        </div>

        {/* Map Skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-32" />
          <div className="h-64 bg-muted rounded-3xl" />
        </div>

        {/* Reviews Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="h-6 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded-full w-16" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-2xl border border-border space-y-2">
              <div className="h-5 bg-muted rounded w-32" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
          <div className="h-12 bg-muted rounded-2xl" />
        </div>

        {/* Contact Button Skeleton */}
        <div className="h-14 bg-muted rounded-2xl" />
      </div>
    </div>
  )
}
