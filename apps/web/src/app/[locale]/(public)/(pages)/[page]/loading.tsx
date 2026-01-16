import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen/50 page-content px-4 md:px-8 lg:px-12 mx-auto max-w-4xl py-8 my-4 rounded-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>

        <div className="h-px bg-border" />

        {/* Intro paragraphs */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        {/* List items */}
        <div className="space-y-3">
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
      </div>
    </div>
  )
}

