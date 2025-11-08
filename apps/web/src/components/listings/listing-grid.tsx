import { ListingCard } from "./listing-card"
import { PaginationWrapper } from "@/components/ui/pagination-wrapper"
import { useLocale } from "next-intl"

interface ListingGridProps {
  data: any[]
  onFavoriteRemoved?: (listingId: number) => void
  openEdit?: boolean
  deleteListing?: boolean
  isLoading?: boolean
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from?: number
    to?: number
  }
}

export function ListingGrid({
  data,
  isLoading,
  onFavoriteRemoved,
  openEdit,
  deleteListing,
  pagination
}: ListingGridProps) {
  const locale = useLocale()
  if (isLoading) return <LoadingSkeleton />
  console.log(data);

  return (
    <div className="space-y-6">
      {/* Listings Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
        {data && data?.map((listing: any) => (
          <div key={listing.id} className="w-full mx-auto">
            <ListingCard
              listing={listing}
              locale={locale}
              onFavoriteRemoved={onFavoriteRemoved}
              openEdit={openEdit}
              deleteListing={deleteListing}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && <PaginationWrapper pagination={pagination} />}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
      {Array.from({ length: 12 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="w-full mx-auto overflow-hidden transition-all duration-300 animate-pulse rounded-2xl">
      {/* Image Skeleton */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-2xl" />
        <div className="absolute inset-0 animate-shimmer opacity-50" />
        {/* Badges Skeleton */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="h-6 w-16 bg-white/90 rounded-full" />
        </div>
        {/* Action Buttons Skeleton */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <div className="h-10 w-10 rounded-full bg-white/90" />
          <div className="h-10 w-10 rounded-full bg-white/90" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="py-5 space-y-4 px-4">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
          <div className="h-5 bg-gray-100 rounded-lg w-1/2" />
        </div>

        {/* Price Skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 bg-gray-100 rounded-lg w-24" />
            <div className="h-7 bg-gray-100 rounded-full w-16" />
          </div>
        </div>

        {/* Property Details Skeleton */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 bg-gray-100 rounded-full" />
            <div className="h-4 bg-gray-100 rounded-lg w-20" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 bg-gray-100 rounded-full" />
            <div className="h-4 bg-gray-100 rounded-lg w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
