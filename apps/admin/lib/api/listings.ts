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
}
