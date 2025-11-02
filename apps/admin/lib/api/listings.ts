import { api } from "@/lib/api-client"
import type { Listing, ListingsResponse, ListingFilters } from "@/lib/types/listing"

export const listingsApi = {
  getAll: async (params: {
    page?: number
    per_page?: number
    filters?: ListingFilters
  }): Promise<ListingsResponse> => {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append("page", String(params.page))
    if (params.per_page) queryParams.append("per_page", String(params.per_page))

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value && value !== "default") {
          queryParams.append(key, value)
        }
      })
    }

    const response = await api.get(`/admin/listings?${queryParams.toString()}`)
    return response.data
  },

  getById: async (id: number): Promise<Listing> => {
    const response = await api.get(`/admin/listings/${id}`)
    return response.data
  },

  create: async (data: Partial<Listing>) => {
    return api.post("/admin/listings", data)
  },

  update: async (id: number, data: Partial<Listing>) => {
    return api.put(`/admin/listings/${id}`, data)
  },

  updateStatus: async (id: number, status: Listing["status"], reason?: string): Promise<Listing> => {
    const response = await api.put(`/admin/listings/${id}/status`, { status, reason })
    return response.data
  },

  quickUpdateStatus: async (id: number, status: Listing["status"]): Promise<Listing> => {
    const response = await api.put(`/admin/listings/${id}`, { status }, { 
      showSuccessToast: true,
      successMessage: "تم تحديث الحالة بنجاح" 
    })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/listings/${id}`)
  },

  reorder: async (listings: Array<{ id: number; sort_order: number }>): Promise<void> => {
    await api.put("/admin/listings/reorder", { listings })
  },

  reorderSingle: async (id: number, sort_order: number): Promise<void> => {
    await api.put(`/admin/listings/${id}/reorder`, { sort_order })
  },
}

/**
 * Transform form data to API format for admin listings
 */
export const transformFormDataToAPI = (formData: any): any => {
  const transformedData: any = {
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
    status: formData.status || "draft",
    properties: formData.properties.map((prop: any, index: number) => ({
      property_id: prop.id,
      value: prop.value,
      sort_order: index + 1
    })),
    features: formData.features.map((id: string) => parseInt(id)),
    media: formData.media.map((mediaItem: any, index: number) => ({
      type: "image",
      url: typeof mediaItem === 'string' ? mediaItem : mediaItem.url,
      source: "file",
      sort_order: index + 1
    })),
    is_featured: formData.is_featured || false,
  }

  return transformedData
}

/**
 * Create a new listing (admin)
 */
export const createListing = async (data: any): Promise<Listing> => {
  const transformedData = transformFormDataToAPI(data)
  const response = await listingsApi.create(transformedData)
  if (response.isError) {
    console.error("❌ Create listing error:", response.message)
    throw new Error(response.message)
  }
  return response.data
}

/**
 * Update an existing listing (admin)
 */
export const updateListing = async (id: number, data: any): Promise<Listing> => {
  const transformedData = transformFormDataToAPI(data)
  const response = await listingsApi.update(id, transformedData)
  if (response.isError) {
    console.error("❌ Update listing error:", response.message)
    throw new Error(response.message)
  }
  return response.data
}

/**
 * Get listing by ID (admin)
 */
export const getListing = async (id: number): Promise<Listing> => {
  const response = await listingsApi.getById(id)
  return response
}
