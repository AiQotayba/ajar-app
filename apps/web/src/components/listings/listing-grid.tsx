import { ListingCard } from "./listing-card"

interface ListingGridProps {
  data: any[]
  onFavoriteRemoved?: (listingId: number) => void
  openEdit?: boolean
  deleteListing?: boolean
}

export function ListingGrid({ data, onFavoriteRemoved, openEdit, deleteListing }: ListingGridProps) {
  return (
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
  )
}
