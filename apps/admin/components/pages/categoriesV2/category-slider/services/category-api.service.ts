import { api, ApiResponse } from "@/lib/api-client"
import type { Category } from "@/lib/types/category"
import { toast } from "sonner"

const urlEndpoint = "/admin/categories"

/**
 * Service layer for category API operations
 * Separates business logic from UI components
 */
export class CategoryApiService {
	/**
	 * Reorders a parent category
	 */
	static async reorderCategory(
		reorderedItem: Category,
		targetItem: Category,
		onSuccess?: () => void | Promise<void>,
		onError?: () => void | Promise<void>
	): Promise<boolean> {
		try {
			// Use targetItem.id for parent categories (same as category-accordion.tsx and category-slider.tsx)
			const requestData = {
				sort_order: targetItem.id,
			}

			const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, requestData)

			// Debug: Log response


			if (response.isError) {
				toast.error(response.message || "فشل في تحديث الترتيب")
				await onError?.()
				return false
			}

			toast.success("تم تحديث ترتيب التصنيف بنجاح")
			await onSuccess?.()
			return true
		} catch (error) {
			const errorMessage = (error as ApiResponse<Category>)?.message || "فشل في تحديث الترتيب"
			toast.error(errorMessage)
			await onError?.()
			return false
		}
	}

	/**
	 * Reorders a child category
	 * Note: For child categories, we use targetItem.id instead of sort_order
	 * because child categories often have duplicate sort_order values
	 */
	static async reorderChildCategory(
		reorderedItem: Category,
		targetItem: Category,
		onSuccess?: () => void | Promise<void>,
		onError?: () => void | Promise<void>
	): Promise<boolean> {
		try {
			// Use targetItem.id for child categories (same as category-accordion.tsx)
			// This is because child categories often have duplicate sort_order values
			const requestData = {
				sort_order: targetItem.sort_order,
			}

			const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, requestData)

			if (response.data) {
				if (Array.isArray(response.data)) {
				} else if (response.data.data && Array.isArray(response.data.data)) {

					// البحث عن الفئة الأب والتحقق من ترتيب الفئات الفرعية
					const parentCategory = response.data.data.find((cat: Category) => cat.id === reorderedItem.parent_id)
					if (parentCategory && parentCategory.children) {
					}
				} else {
				}
			} else {
			}

			if (response.isError) {
				toast.error(response.message || "فشل في تحديث ترتيب الفئة الفرعية")
				await onError?.()
				return false
			}

			toast.success("تم تحديث ترتيب الفئة الفرعية بنجاح")
			await onSuccess?.()
			return true
		} catch (error: unknown) {
			const errorMessage = (error as ApiResponse<Category>)?.message || "فشل في تحديث ترتيب الفئة الفرعية"
			toast.error(errorMessage)
			await onError?.()
			return false
		}
	}

	/**
	 * Validates and sanitizes icon URL
	 */
	static sanitizeIconUrl(icon: string | null | undefined): string | null {
		if (!icon) return null

		// If already a full URL, validate it
		if (icon.startsWith("http://") || icon.startsWith("https://")) {
			try {
				new URL(icon)
				return icon
			} catch {
				return null
			}
		}

		// Build storage URL
		const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "https://ajar-backend.mystore.social"

		// Sanitize path - remove any path traversal attempts
		const sanitizedPath = icon.replace(/\.\./g, "").replace(/[^a-zA-Z0-9/._-]/g, "")

		return `${baseUrl}/storage/${sanitizedPath}`
	}
}

