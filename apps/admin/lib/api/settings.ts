import { api } from "@/lib/api-client"
import type { Setting } from "@/lib/types/setting"

export const settingsApi = {
  // Get all settings
  getAll: (params?: { page?: number; per_page?: number }) => {
    return api.get("/admin/settings", { params })
  },

  // Get single setting
  getById: (id: number) => {
    return api.get(`/admin/settings/${id}`)
  },

  // Get setting by key
  getByKey: (key: string) => {
    return api.get(`/admin/settings/key/${key}`)
  },

  // Create setting
  create: (data: Partial<Setting>) => {
    return api.post("/admin/settings", data)
  },

  // Update setting
  update: (id: number, data: Partial<Setting>) => {
    return api.put(`/admin/settings/${id}`, data)
  },

  // Update setting by key
  updateByKey: (key: string, value: string) => {
    return api.put(`/admin/settings/key/${key}`, { value })
  },

  // Delete setting
  delete: (id: number) => {
    return api.delete(`/admin/settings/${id}`)
  },
}

