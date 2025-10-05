import { Suspense } from "react"
import { PropertyDetails } from "@/components/property/property-details"
import { PropertyDetailsSkeleton } from "@/components/property/property-details-skeleton"

export default function PropertyPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<PropertyDetailsSkeleton />}>
      <PropertyDetails propertyId={params.id} />
    </Suspense>
  )
}
