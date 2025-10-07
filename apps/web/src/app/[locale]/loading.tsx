import { BottomNav } from "@/components/layout/bottom-nav"
import { Header } from "@/components/layout/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <Header title="الرئيسية" showNotification />

      <main className="space-y-6">
        {/* Search Section - تطابق SearchBar */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 bg-primary/20 rounded-2xl w-full lg:max-w-lg mx-auto">
            <div className="flex flex-row w-full relative">
              {/* Search Icon Skeleton */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              {/* Input Skeleton */}
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
            {/* Filter Button Skeleton */}
            <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
          </div>
        </div>

        {/* Hero Slider - تطابق HeroSlider */}
        <div className="px-4">
          <div className="relative w-full">
            {/* Carousel Skeleton */}
            <Skeleton className="h-56 w-full rounded-3xl mx-auto" />

            {/* Pagination Dots Skeleton */}
            <div className="flex justify-center gap-2 mt-4">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-8 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-2 w-2 rounded-full" />
            </div>
          </div>
        </div>

        {/* Category Filter - تطابق CategoryFilter */}
        <div className="w-full">
          <div className="flex w-full h-auto gap-2 p-1 overflow-x-auto scrollbar-hide">
            <Skeleton className="h-10 w-24 rounded-full flex-shrink-0" />
            <Skeleton className="h-10 w-28 rounded-full flex-shrink-0" />
            <Skeleton className="h-10 w-20 rounded-full flex-shrink-0" />
            <Skeleton className="h-10 w-32 rounded-full flex-shrink-0" />
            <Skeleton className="h-10 w-22 rounded-full flex-shrink-0" />
          </div>
        </div>

        {/* Listings Grid - تطابق ListingGrid */}
        <div className="px-4">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="w-full mx-auto">
                <div className="bg-card rounded-2xl overflow-hidden transition-all duration-300">
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden">
                    <Skeleton className="h-full w-full rounded-2xl" />

                    {/* Action Buttons Skeleton */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>

                    {/* Badge Skeleton */}
                    <div className="absolute top-4 right-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="py-5 space-y-4">
                    {/* Title & Description */}
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Price Section */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
