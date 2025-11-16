"use client"
import { ListingForm } from "@/components/listings/form"
import { useParams } from "next/navigation"

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const listingId = id ? parseInt(id) : null

  return (
    <ListingForm
      mode="edit"
      listingId={listingId}
    />
  )
}
