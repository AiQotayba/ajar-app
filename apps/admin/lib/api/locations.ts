import { api } from '@/lib/api'
import type { Governorate, City, GovernorateFormData, CityFormData } from '../types/location'

export const locationsApi = {
    // Governorates
    getAllGovernorates: async () => {
        return api.get<{ data: Governorate[] }>('/admin/governorates')
    },

    getGovernorateById: async (id: number) => {
        return api.get<{ data: Governorate }>(`/admin/governorates/${id}`)
    },

    createGovernorate: async (data: GovernorateFormData) => {
        return api.post<{ data: Governorate }>('/admin/governorates', data)
    },

    updateGovernorate: async (id: number, data: Partial<GovernorateFormData>) => {
        return api.put<{ data: Governorate }>(`/admin/governorates/${id}`, data)
    },

    deleteGovernorate: async (id: number) => {
        return api.delete(`/admin/governorates/${id}`)
    },

    toggleGovernorateStatus: async (id: number, is_active: boolean) => {
        return api.patch(`/admin/governorates/${id}/status`, { is_active })
    },

    // Cities
    getAllCities: async () => {
        return api.get<{ data: City[] }>('/admin/cities')
    },

    getCityById: async (id: number) => {
        return api.get<{ data: City }>(`/admin/cities/${id}`)
    },

    createCity: async (data: CityFormData) => {
        return api.post<{ data: City }>('/admin/cities', data)
    },

    updateCity: async (id: number, data: Partial<CityFormData>) => {
        return api.put<{ data: City }>(`/admin/cities/${id}`, data)
    },

    deleteCity: async (id: number) => {
        return api.delete(`/admin/cities/${id}`)
    },

    toggleCityStatus: async (id: number, is_active: boolean) => {
        return api.patch(`/admin/cities/${id}/status`, { is_active })
    },
}

