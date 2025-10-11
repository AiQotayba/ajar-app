import { apiClient } from "@/lib/api-client"
import type { CategoriesResponse, Category } from "@/lib/types/category"

export async function getCategories(): Promise<CategoriesResponse> {
  return apiClient.get<CategoriesResponse>("/admin/categories")
}

export async function getCategoryById(id: number): Promise<Category> {
  const response = await apiClient.get<{ success: boolean; data: Category }>(`/admin/categories/${id}`)
  return response.data
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await apiClient.post<{ success: boolean; data: Category }>("/admin/categories", data)
  return response.data
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const response = await apiClient.put<{ success: boolean; data: Category }>(`/admin/categories/${id}`, data)
  return response.data
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`)
}

export async function toggleCategoryVisibility(id: number, is_visible: boolean): Promise<Category> {
  const response = await apiClient.patch<{ success: boolean; data: Category }>(`/admin/categories/${id}/visibility`, {
    is_visible,
  })
  return response.data
}
