import { ListingCard } from "./listing-card"
import { PaginationWrapper } from "@/components/ui/pagination-wrapper" 
import { Skeleton } from "@/components/ui/skeleton"

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

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      {/* Listings Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
        {data?.map((listing: any) => (
          <div key={listing.id} className="w-full mx-auto">
            <ListingCard 
              listing={listing} 
              onFavoriteRemoved={onFavoriteRemoved}
              openEdit={openEdit}
              deleteListing={deleteListing}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <PaginationWrapper pagination={pagination} />
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton key={index} className="h-48 w-full rounded-3xl mx-auto" />
      ))}
    </div>
  )
}