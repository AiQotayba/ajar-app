import { Skeleton } from '@/components/ui/skeleton'

export default function PageLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 md:px-8 lg:px-12 mx-auto max-w-4xl py-8 space-y-6">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Content Paragraphs */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Subheading */}
        <div className="space-y-3 pt-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-4 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Subheading */}
        <div className="space-y-3 pt-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* List Items Skeleton */}
        <div className="space-y-3 pt-2">
          <div className="flex gap-3">
            <Skeleton className="h-4 w-4 rounded-full mt-1 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-4 w-4 rounded-full mt-1 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-4 w-4 rounded-full mt-1 flex-shrink-0" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-4 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Subheading */}
        <div className="space-y-3 pt-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Final Paragraphs */}
        <div className="space-y-4 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

