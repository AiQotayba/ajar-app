import { api } from '@/lib/api'
import type { Property, PropertyFormData } from '../types/property'

export const propertiesApi = {
    getAll: async () => {
        return api.get<{ data: Property[] }>('/admin/properties')
    },

    getById: async (id: number) => {
        return api.get<{ data: Property }>(`/admin/properties/${id}`)
    },

    create: async (data: PropertyFormData) => {
        return api.post<{ data: Property }>('/admin/properties', data)
    },

    update: async (id: number, data: Partial<PropertyFormData>) => {
        return api.put<{ data: Property }>(`/admin/properties/${id}`, data)
    },

    delete: async (id: number) => {
        return api.delete(`/admin/properties/${id}`)
    },

    toggleVisibility: async (id: number, is_visible: boolean) => {
        return api.patch(`/admin/properties/${id}/visibility`, { is_visible })
    },

    updateSortOrder: async (id: number, sort_order: number) => {
        return api.patch(`/admin/properties/${id}/sort-order`, { sort_order })
    },
}

