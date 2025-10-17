import { api, apiClient } from "@/lib/api-client"
import type { CategoriesResponse, Category } from "@/lib/types/category"

export async function getCategories() {
  return apiClient.get<CategoriesResponse>("/admin/categories")
}

export async function getCategoryById(id: number) {
  return apiClient.get<Category>(`/admin/categories/${id}`)
}

export async function createCategory(data: Partial<Category>) {
  return apiClient.post<Category>("/admin/categories", data)
}

export async function updateCategory(id: number, data: Partial<Category>) {
  return apiClient.put<Category>(`/admin/categories/${id}`, data)
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`)
}

export async function toggleCategoryVisibility(id: number, is_visible: boolean) {
  return apiClient.patch<Category>(`/admin/categories/${id}/visibility`, {
    is_visible,
  })
}

// New API object for consistency with other modules
export const categoriesApi = {
  // Get all categories
  getAll: (params?: { page?: number; per_page?: number }) => {
    return api.get("/admin/categories", { params })
  },

  // Get single category
  getById: (id: number) => {
    return api.get(`/admin/categories/${id}`)
  },

  // Create category
  create: (data: Partial<Category>) => {
    return api.post("/admin/categories", data)
  },

  // Update category
  update: (id: number, data: Partial<Category>) => {
    return api.put(`/admin/categories/${id}`, data)
  },

  // Delete category
  delete: (id: number) => {
    return api.delete(`/admin/categories/${id}`)
  },

  // Toggle visibility status
  toggleVisibility: (id: number, is_visible: boolean) => {
    return api.patch(`/admin/categories/${id}/visibility`, { is_visible })
  },
}
