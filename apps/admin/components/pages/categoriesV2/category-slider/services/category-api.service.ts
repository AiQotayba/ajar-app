import { api } from "@/lib/api-client"
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
	 * Uses targetItem.sort_order to place the reordered item at the target position
	 * 
	 * @param reorderedItem The category being moved
	 * @param targetItem The target position category
	 * @param categories Optional: current list of categories for validation
	 * @param onSuccess Callback on success
	 * @param onError Callback on error
	 */
	static async reorderCategory(
		reorderedItem: Category,
		targetItem: Category,
		categories: Category[] = [],
		onSuccess?: () => void | Promise<void>,
		onError?: () => void | Promise<void>
	): Promise<boolean> {
		try {
			// Validation: Ensure both items exist
			if (!reorderedItem?.id || !targetItem?.id) {
				toast.error("عنصر غير صالح")
				return false
			}

			// Validation: Ensure targetItem has valid sort_order
			let sortOrder: number

			if (typeof targetItem.sort_order === "number" && !isNaN(targetItem.sort_order)) {
				sortOrder = Math.round(targetItem.sort_order) // Ensure integer
			} else if (targetItem.sort_order === null || targetItem.sort_order === undefined) {
				// If sort_order is null/undefined, try to calculate a default value from categories array
				console.warn("targetItem.sort_order is null/undefined, attempting to calculate default value")

				if (categories.length > 0) {
					// Find targetItem in categories array
					const targetInArray = categories.find(c => c.id === targetItem.id)
					if (targetInArray && typeof targetInArray.sort_order === "number" && !isNaN(targetInArray.sort_order)) {
						sortOrder = Math.round(targetInArray.sort_order)
					} else {
						// Try to get sort_order from first category as fallback
						const firstCategory = categories[0]
						if (firstCategory && typeof firstCategory.sort_order === "number" && !isNaN(firstCategory.sort_order)) {
							sortOrder = Math.round(firstCategory.sort_order)
						} else {
							toast.error("قيمة الترتيب غير صالحة")
							return false
						}
					}
				} else {
					console.error("targetItem.sort_order is null/undefined and no categories array provided:", targetItem)
					toast.error("قيمة الترتيب غير صالحة")
					return false
				}
			} else {
				console.error("targetItem.sort_order is not a valid number:", targetItem.sort_order, targetItem)
				toast.error("قيمة الترتيب غير صالحة")
				return false
			}

			// Ensure sort_order is a positive integer
			if (sortOrder < 0 || !Number.isInteger(sortOrder)) {
				console.error("Invalid sort_order value:", sortOrder)
				toast.error("قيمة الترتيب يجب أن تكون رقماً صحيحاً موجباً")
				return false
			}

			// Optional: Validate items exist in categories array if provided
			if (categories.length > 0) {
				const reorderedExists = categories.some((c) => c.id === reorderedItem.id)
				const targetExists = categories.some((c) => c.id === targetItem.id)

				if (!reorderedExists || !targetExists) {
					console.warn("Items not found in categories array, proceeding anyway")
				}
			}

			// Call API to update sort order on server
			// API expects: PUT /{urlEndpoint}/{id}/reorder with body: { sort_order: value }
			// We use targetItem.sort_order to place the reordered item at the target position
			const requestData = {
				sort_order: sortOrder,
			}

			console.info("Sending reorder request:", {
				reorderedItemId: reorderedItem.id,
				sortOrder: sortOrder,
				targetItemId: targetItem.id,
			})

			const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, requestData)

			if (response.isError) {
				toast.error(response.message || "فشل في تحديث الترتيب")
				await onError?.()
				return false
			}

			toast.success("تم تحديث ترتيب التصنيف بنجاح")
			await onSuccess?.()
			return true
		} catch (error: unknown) {
			console.error("Error updating category sort order:", error)
			const errorMessage =
				(error && typeof error === "object" && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: null) ||
				(error && typeof error === "object" && "message" in error ? (error as { message?: string }).message : null) ||
				"فشل في تحديث الترتيب"
			toast.error(errorMessage)
			await onError?.()
			return false
		}
	}

	/**
	 * Reorders a child category
	 * Uses targetItem.sort_order to place the reordered item at the target position
	 * 
	 * @param reorderedItem The child category being moved
	 * @param targetItem The target position category
	 * @param targetIndex The target index position (0-based) - kept for compatibility but checking targetItem.sort_order first
	 * @param parentCategory Optional: parent category for validation
	 * @param onSuccess Callback on success
	 * @param onError Callback on error
	 */
	static async reorderChildCategory(
		reorderedItem: Category,
		targetItem: Category,
		targetIndex: number,
		parentCategory?: Category,
		onSuccess?: () => void | Promise<void>,
		onError?: () => void | Promise<void>
	): Promise<boolean> {
		try {
			// Validation: Ensure both items exist
			if (!reorderedItem?.id || !targetItem?.id) {
				toast.error("عنصر غير صالح")
				return false
			}

			// Validation: Ensure targetItem has valid sort_order - same logic as parent categories
			let sortOrder: number

			if (typeof targetItem.sort_order === "number" && !isNaN(targetItem.sort_order)) {
				sortOrder = Math.round(targetItem.sort_order) // Ensure integer
			} else {
				// Fallback: try to calculate from parent category children or target index
				console.warn("targetItem.sort_order is null/undefined/invalid for child, attempting calculation")

				if (parentCategory?.children && parentCategory.children.length > 0) {
					// Find targetItem in parent children
					const targetInArray = parentCategory.children.find(c => c.id === targetItem.id)
					if (targetInArray && typeof targetInArray.sort_order === "number" && !isNaN(targetInArray.sort_order)) {
						sortOrder = Math.round(targetInArray.sort_order)
					} else {
						// Fallback to index based if sort_order is missing
						sortOrder = targetIndex
					}
				} else {
					sortOrder = targetIndex
				}
			}

			// Ensure sort_order is a positive integer
			sortOrder = Math.max(0, Math.round(sortOrder))

			// Optional: Validate items exist in parent's children if provided
			if (parentCategory?.children) {
				const reorderedExists = parentCategory.children.some((c) => c.id === reorderedItem.id)
				const targetExists = parentCategory.children.some((c) => c.id === targetItem.id)

				if (!reorderedExists || !targetExists) {
					console.warn("Child items not found in parent category, proceeding anyway")
				}
			}

			// Call API to update sort order on server
			// API expects: PUT /{urlEndpoint}/{id}/reorder with body: { sort_order: value }
			const requestData = {
				sort_order: sortOrder,
			}

			console.info("Sending reorder request (child):", {
				reorderedItemId: reorderedItem.id,
				sortOrder: sortOrder,
				targetItemId: targetItem.id,
			})

			const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, requestData)

			if (response.isError) {
				toast.error(response.message || "فشل في تحديث ترتيب الفئة الفرعية")
				await onError?.()
				return false
			}

			toast.success("تم تحديث ترتيب الفئة الفرعية بنجاح")
			await onSuccess?.()
			return true
		} catch (error: unknown) {
			console.error("Error updating child category sort order:", error)
			const errorMessage =
				(error && typeof error === "object" && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: null) ||
				(error && typeof error === "object" && "message" in error ? (error as { message?: string }).message : null) ||
				"فشل في تحديث ترتيب الفئة الفرعية"
			toast.error(errorMessage)
			await onError?.()
			return false
		}
	}

	/**
	 * Preserves all category properties when creating update payload
	 * This ensures properties, features, and children are not lost during updates
	 * 
	 * @param category Original category
	 * @param updates Partial updates to apply
	 * @returns Category with preserved properties
	 */
	static preserveCategoryData(category: Category, updates: Partial<Category>): Category {
		return {
			...category,
			...updates,
			// Preserve existing properties and features if not provided in updates
			properties: updates.properties ?? category.properties ?? [],
			features: updates.features ?? category.features ?? [],
			children: updates.children ?? category.children ?? [],
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

