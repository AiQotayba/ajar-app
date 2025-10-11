import { api } from "@/lib/api-client"
import type { Review } from "@/lib/types/review"

export const reviewsApi = {
  // Get all reviews
  getAll: (params?: { page?: number; per_page?: number }) => {
    return api.get("/admin/reviews", { params })
  },

  // Get single review
  getById: (id: number) => {
    return api.get(`/admin/reviews/${id}`)
  },

  // Update review (approve/reject)
  update: (id: number, data: Partial<Review>) => {
    return api.put(`/admin/reviews/${id}`, data)
  },

  // Approve review
  approve: (id: number) => {
    return api.put(`/admin/reviews/${id}`, { is_approved: true })
  },

  // Reject/Withhold review
  reject: (id: number) => {
    return api.put(`/admin/reviews/${id}`, { is_approved: false })
  },

  // Delete review
  delete: (id: number) => {
    return api.delete(`/admin/reviews/${id}`)
  },
}

