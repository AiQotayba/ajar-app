import { api } from '@/lib/api'
import type { Feature, FeatureFormData } from '../types/feature'

export const featuresApi = {
  getAll: async () => {
    return api.get<{ data: Feature[] }>('/admin/features')
  },

  getById: async (id: number) => {
    return api.get<{ data: Feature }>(`/admin/features/${id}`)
  },

  create: async (data: FeatureFormData) => {
    return api.post<{ data: Feature }>('/admin/features', data)
  },

  update: async (id: number, data: Partial<FeatureFormData>) => {
    return api.put<{ data: Feature }>(`/admin/features/${id}`, data)
  },

  delete: async (id: number) => {
    return api.delete(`/admin/features/${id}`)
  },

  updateSortOrder: async (id: number, sort_order: number) => {
    return api.patch(`/admin/features/${id}/sort-order`, { sort_order })
  },
}

