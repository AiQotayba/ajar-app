export function ListingsDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gallery Section */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-0">
            <div className="lg:sticky lg:top-6">
              {/* Main Gallery Image Skeleton */}
              <div className="relative h-96 overflow-hidden rounded-3xl bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse">
                <div className="absolute inset-0 animate-shimmer opacity-50" />
                {/* Badges Skeleton */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <div className="h-7 w-16 bg-white/90 rounded-full" />
                  <div className="h-7 w-20 bg-white/90 rounded-full" />
                </div>
                {/* Action Buttons Skeleton */}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  <div className="h-10 w-10 rounded-full bg-white/90" />
                  <div className="h-10 w-10 rounded-full bg-white/90" />
                </div>
              </div>
              {/* Thumbnail Gallery Skeleton */}
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer opacity-30" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className="lg:col-span-1 space-y-6 animate-pulse">
            {/* Title Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-6 bg-gray-200 rounded-lg w-full" />
              <div className="h-6 bg-gray-200 rounded-lg w-5/6" />
            </div>

            {/* Price Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-10 bg-gray-200 rounded-lg w-32" />
              <div className="h-7 bg-gray-200 rounded-full w-20" />
            </div>

            {/* Stats Skeleton */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>

            {/* Features Skeleton */}
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-full w-28" />
                ))}
              </div>
            </div>

            {/* WhatsApp Button Skeleton - Desktop */}
            <div className="hidden lg:block h-14 bg-gray-200 rounded-2xl" />

            {/* WhatsApp Button Skeleton - Mobile (positioned at bottom) */}
            <div className="lg:hidden fixed bottom-0 left-4 right-4 z-50 pb-4 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-2xl" />
            </div>
          </div>

          {/* Location Section */}
          <div className="*:w-full flex flex-col lg:grid lg:grid-cols-3 lg:col-span-2 gap-4 animate-pulse">
            <div className="space-y-4 lg:col-span-2">
              <div className="h-6 bg-gray-200 rounded w-24" />
              {/* Location Text Skeleton */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </div>
              {/* Map Skeleton */}
              <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200">
                <div className="absolute inset-0 animate-shimmer opacity-50" />
              </div>
            </div>

            {/* Reviews Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-24" />
                <div className="h-10 bg-gray-200 rounded-full w-16" />
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-border space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
              <div className="h-12 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
