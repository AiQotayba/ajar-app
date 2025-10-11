import { api } from "@/lib/api-client"
import type { Slider } from "@/lib/types/slider"

export const slidersApi = {
  // Get all sliders
  getAll: (params?: { page?: number; per_page?: number }) => {
    return api.get("/admin/sliders", { params })
  },

  // Get single slider
  getById: (id: number) => {
    return api.get(`/admin/sliders/${id}`)
  },

  // Create slider
  create: (data: Partial<Slider>) => {
    return api.post("/admin/sliders", data)
  },

  // Update slider
  update: (id: number, data: Partial<Slider>) => {
    return api.put(`/admin/sliders/${id}`, data)
  },

  // Delete slider
  delete: (id: number) => {
    return api.delete(`/admin/sliders/${id}`)
  },

  // Toggle active status
  toggleActive: (id: number, active: boolean) => {
    return api.put(`/admin/sliders/${id}`, { active })
  },
}

