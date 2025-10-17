import { CreatePropertyForm } from "@/components/property/create-property-form"

// Mock function to fetch property data - replace with real API call
async function getPropertyData(id: string) {
  // This would fetch from your API
  return {
    title: "شقة عائلية واسعة ومفروشة",
    propertyType: "بيت",
    category: "إجار",
    area: "250",
    rooms: "5",
    furnished: "furnished" as const,
    governorate: "حلب",
    city: "إجار",
    latitude: 36.2021,
    longitude: 37.1343,
    images: [
      { url: "/images/placeholder.svg?height=400&width=600", isCover: true },
      { url: "/images/placeholder.svg?height=400&width=600", isCover: false },
    ],
    price: "400",
    paymentFrequency: "كل شهر تقريباً",
    insurance: "200",
  }
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const propertyData = await getPropertyData(id)

  return <CreatePropertyForm initialData={propertyData} isEditing={true} />
}
