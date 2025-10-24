import { api } from "../api"

export interface CreateListingRequest {
  title: {
    ar: string
    en?: string
  }
  description: {
    ar?: string
    en?: string
  }
  category_id: number
  governorate_id: number
  city_id?: number | null
  price: number
  currency: string
  latitude?: string | null
  longitude?: string | null
  type: "sale" | "rent"
  availability_status: "available" | "rented" | "sold" | "reserved"
  status: "draft" | "active" | "inactive" | "pending" | "rejected"
  properties: Array<{
    property_id: number
    value: string
    sort_order: number
  }>
  features: number[]
  media: Array<{
    type: "image"
    url: string
    source: "file"
    sort_order: number
  }>
}

export interface UpdateListingRequest extends CreateListingRequest {
  id?: number
}

export interface ListingResponse {
  id: number
  title: {
    ar: string
    en?: string
  }
  description: {
    ar?: string
    en?: string
  }
  category_id: number
  governorate_id: number
  city_id?: number | null
  price: number
  currency: string
  latitude?: string | null
  longitude?: string | null
  type: "sale" | "rent"
  availability_status: "available" | "rented" | "sold" | "reserved"
  status: "draft" | "active" | "inactive" | "pending" | "rejected"
  properties: Array<{
    property_id: number
    value: string
    sort_order: number
  }>
  features: number[]
  media: Array<{
    type: "image"
    url: string
    source: "file"
    sort_order: number
  }>
  created_at: string
  updated_at: string
}

/**
 * Create a new listing
 * POST /user/listings
 */
export const createListing = async (data: CreateListingRequest): Promise<ListingResponse> => {
  console.log("🚀 ===== CREATING LISTING =====")
  console.log("🚀 API Request Data:", data)
  
  const response = await api.post("/user/listings", data)
  
  if (response.isError) {
    console.error("❌ Create listing error:", response.message)
    throw new Error(response.message)
  }
  
  console.log("✅ Listing created successfully:", response.data)
  return response.data
}

/**
 * Update an existing listing
 * PUT /user/listings/:id
 */
export const updateListing = async (id: number, data: UpdateListingRequest): Promise<ListingResponse> => {
  console.log("🔄 ===== UPDATING LISTING =====")
  console.log("🔄 Listing ID:", id)
  console.log("🔄 API Request Data:", data)
  
  const response = await api.put(`/user/listings/${id}`, data)
  
  if (response.isError) {
    console.error("❌ Update listing error:", response.message)
    throw new Error(response.message)
  }
  
  console.log("✅ Listing updated successfully:", response.data)
  return response.data
}

/**
 * Get a listing by ID
 * GET /user/listings/:id
 */
export const getListing = async (id: number): Promise<ListingResponse> => {
  console.log("📖 ===== GETTING LISTING =====")
  console.log("📖 Listing ID:", id)
  
  const response = await api.get(`/user/listings/${id}`)
  
  if (response.isError) {
    console.error("❌ Get listing error:", response.message)
    throw new Error(response.message)
  }
  
  console.log("✅ Listing retrieved successfully:", response.data)
  return response.data
}

/**
 * Get all user listings
 * GET /user/listings
 */
export const getUserListings = async (): Promise<ListingResponse[]> => {
  console.log("📋 ===== GETTING USER LISTINGS =====")
  
  const response = await api.get("/user/listings")
  
  if (response.isError) {
    console.error("❌ Get user listings error:", response.message)
    throw new Error(response.message)
  }
  
  console.log("✅ User listings retrieved successfully:", response.data)
  return response.data
}

/**
 * Delete a listing
 * DELETE /user/listings/:id
 */
export const deleteListing = async (id: number): Promise<void> => {
  console.log("🗑️ ===== DELETING LISTING =====")
  console.log("🗑️ Listing ID:", id)
  
  const response = await api.delete(`/user/listings/${id}`)
  
  if (response.isError) {
    console.error("❌ Delete listing error:", response.message)
    throw new Error(response.message)
  }
  
  console.log("✅ Listing deleted successfully")
}

/**
 * Transform form data to API format
 */
export const transformFormDataToAPI = (formData: any): CreateListingRequest => {
  console.log("🔄 ===== TRANSFORMING FORM DATA =====")
  console.log("🔄 Raw form data:", formData)
  
  const transformedData: CreateListingRequest = {
    title: {
      ar: formData.title.ar,
      en: formData.title.en || ""
    },
    description: {
      ar: formData.description.ar || "",
      en: formData.description.en || ""
    },
    category_id: parseInt(formData.category_id),
    governorate_id: parseInt(formData.governorate_id),
    city_id: formData.city_id ? parseInt(formData.city_id) : null,
    price: formData.price,
    currency: "JOD", // Default currency
    latitude: formData.latitude?.toString() || null,
    longitude: formData.longitude?.toString() || null,
    type: formData.type,
    availability_status: formData.availability_status,
    status: "draft", // Default status
    properties: formData.properties.map((prop: any, index: number) => ({
      property_id: prop.id,
      value: prop.value,
      sort_order: index + 1
    })),
    features: formData.features.map((id: string) => parseInt(id)),
    media: formData.media.map((file: any, index: number) => ({
      type: "image",
      url: `listings/${file.name}`, // This should be handled by file upload
      source: "file",
      sort_order: index + 1
    }))
  }
  
  console.log("🔄 Transformed data:", transformedData)
  console.log("🔄 ===== END TRANSFORMATION =====")
  
  return transformedData
}

/**
 * Example API request data structure
 */
export const EXAMPLE_LISTING_DATA: CreateListingRequest = {
  title: {
    ar: "فيلا للبيع في عمان",
    en: "Villa for Sale in Amman"
  },
  description: {
    ar: "فيلا جميلة في منطقة راقية",
    en: "Beautiful villa in upscale area"
  },
  category_id: 1,
  governorate_id: 1,
  city_id: 1,
  price: 150000,
  currency: "JOD",
  latitude: "31.9454",
  longitude: "35.9284",
  type: "sale",
  availability_status: "available",
  status: "draft",
  properties: [
    {
      property_id: 1,
      value: "4",
      sort_order: 1
    }
  ],
  features: [1, 2, 3],
  media: [
    {
      type: "image",
      url: "listings/image1.jpg",
      source: "file",
      sort_order: 1
    },
    {
      type: "image",
      url: "listings/image2.jpg",
      source: "file",
      sort_order: 2
    },
    {
      type: "image",
      url: "listings/image3.jpg",
      source: "file",
      sort_order: 3
    },
    {
      type: "image",
      url: "listings/image4.jpg",
      source: "file",
      sort_order: 4
    },
    {
      type: "image",
      url: "listings/image5.jpg",
      source: "file",
      sort_order: 5
    }
  ]
}
