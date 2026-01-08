"use client"

import * as React from "react"
import type { Category } from "@/lib/types/category"
import { useQueryClient } from "@tanstack/react-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCategoryState } from "./hooks/use-category-state"
import { useScrollPreservation } from "./hooks/use-scroll-preservation"
import { CategoryApiService } from "./services/category-api.service"
import { CategoryItem } from "./components/category-item"
import { DragToggleButton } from "./components/drag-toggle-button"

interface CategoriesSliderProps {
	categories: Category[]
	onSelectCategory: (category: Category | null) => void
	selectedCategory: Category | null
	onReorder?: () => void
}

/**
 * CategoriesSlider v2 - Refactored and optimized version
 * 
 * Improvements:
 * - Separated concerns (hooks, services, components)
 * - Using useReducer for state management
 * - Memoized components for performance
 * - Security improvements (sanitized URLs)
 * - Removed excessive logging
 * - Better error handling
 */
export function CategoriesSliderV2({ categories, onSelectCategory, selectedCategory, onReorder }: CategoriesSliderProps) {
	const queryClient = useQueryClient()
	const containerRef = React.useRef<HTMLDivElement>(null)
	
	// Ensure categories is always an array
	const safeCategories = React.useMemo(() => {
		// Handle both array and object with data property
		if (Array.isArray(categories)) {
			return categories
		}
		if (categories && typeof categories === 'object' && 'data' in categories) {
			const data = (categories as { data: Category[] }).data
			return Array.isArray(data) ? data : []
		}
		return []
	}, [categories])
	
	const { state, actions } = useCategoryState(safeCategories)
	const { preserveScroll } = useScrollPreservation()

	// Memoized handlers
	const handleSelectCategory = React.useCallback(
		(category: Category, event?: React.MouseEvent) => {
			preserveScroll(() => onSelectCategory(category), event, containerRef)
		},
		[onSelectCategory, preserveScroll]
	)

	// Parent category drag handlers
	const handleDragStart = React.useCallback(
		(index: number, e: React.DragEvent) => {
			if (!state.isDragEnabled) return
			e.stopPropagation()
			e.dataTransfer.effectAllowed = "move"
			e.dataTransfer.setData("text/plain", index.toString())
			actions.setDraggedIndex(index)
		},
		[state.isDragEnabled, actions]
	)

	const handleDragOver = React.useCallback(
		(e: React.DragEvent, index: number) => {
			if (!state.isDragEnabled) return
			if (state.draggedIndex !== null && state.draggedIndex !== index) {
				actions.setHoveredIndex(index)
			}
		},
		[state.isDragEnabled, state.draggedIndex, actions]
	)

	const handleDrop = React.useCallback(
		async (e: React.DragEvent, dropIndex: number) => {
			if (!state.isDragEnabled || state.draggedIndex === null || state.draggedIndex === dropIndex) {
				actions.setDraggedIndex(null)
				return
			}

			// Ensure state.categories is an array
			if (!Array.isArray(state.categories)) {
				actions.setDraggedIndex(null)
				return
			}

			const items = Array.from(state.categories)
			const [reorderedItem] = items.splice(state.draggedIndex, 1)
			items.splice(dropIndex, 0, reorderedItem)
			const targetItem = state.categories[dropIndex]

			// Optimistic update
			actions.updateCategories(items)
			actions.setDraggedIndex(null)
			actions.setHoveredIndex(null)

			// API call - pass categories array for validation
			const success = await CategoryApiService.reorderCategory(
				reorderedItem,
				targetItem,
				state.categories, // Pass categories array for validation
				async () => {
					if (onReorder) {
						await onReorder()
					} else {
						await queryClient.refetchQueries({ queryKey: ["categories"] })
					}
				},
				async () => {
					// Revert on error
					actions.setCategories(categories)
					if (onReorder) {
						await onReorder()
					} else {
						await queryClient.refetchQueries({ queryKey: ["categories"] })
					}
				}
			)

			if (!success) {
				actions.setCategories(categories)
			}
		},
		[state.isDragEnabled, state.draggedIndex, state.categories, categories, actions, onReorder, queryClient]
	)

	const handleDragEnter = React.useCallback(
		(e: React.DragEvent, index: number) => {
			if (state.isDragEnabled && state.draggedIndex !== null && state.draggedIndex !== index) {
				actions.setHoveredIndex(index)
			}
		},
		[state.isDragEnabled, state.draggedIndex, actions]
	)

	const handleDragLeave = React.useCallback(() => {
		actions.setHoveredIndex(null)
	}, [actions])

	const handleDragEnd = React.useCallback(() => {
		actions.resetDragState()
	}, [actions])

	// Child category drag handlers
	const handleChildDragStart = React.useCallback(
		(parentId: number, index: number, e: React.DragEvent) => {
			if (!state.isDragEnabled) return
			e.stopPropagation()
			e.dataTransfer.effectAllowed = "move"
			e.dataTransfer.setData("text/plain", index.toString())
			e.dataTransfer.setData("application/json", JSON.stringify({ index, parentId }))
			actions.setDraggedChildIndex({ parentId, index })
		},
		[state.isDragEnabled, actions]
	)

	const handleChildDragOver = React.useCallback(
		(e: React.DragEvent, parentId: number, index: number) => {
			if (!state.isDragEnabled) return
			e.preventDefault()
			e.stopPropagation()
			e.dataTransfer.dropEffect = "move"
			if (
				state.draggedChildIndex !== null &&
				state.draggedChildIndex.parentId === parentId &&
				state.draggedChildIndex.index !== index
			) {
				actions.setHoveredChildIndex({ parentId, index })
			}
		},
		[state.isDragEnabled, state.draggedChildIndex, actions]
	)

	const handleChildDrop = React.useCallback(
		async (e: React.DragEvent, parentId: number, dropIndex: number) => {
			if (
				!state.isDragEnabled ||
				state.draggedChildIndex === null ||
				state.draggedChildIndex.parentId !== parentId ||
				state.draggedChildIndex.index === dropIndex
			) {
				actions.setDraggedChildIndex(null)
				actions.setHoveredChildIndex(null)
				return
			}

			// Find parent category
			const findParentCategory = (cats: Category[]): Category | null => {
				if (!Array.isArray(cats)) return null
				for (const cat of cats) {
					if (cat.id === parentId) return cat
					if (cat.children && cat.children.length > 0) {
						const found = findParentCategory(cat.children)
						if (found) return found
					}
				}
				return null
			}

			// Ensure state.categories is an array
			if (!Array.isArray(state.categories)) {
				actions.setDraggedChildIndex(null)
				actions.setHoveredChildIndex(null)
				return
			}

			const parentCategory = findParentCategory(state.categories)
			if (!parentCategory || !parentCategory.children) {
				actions.setDraggedChildIndex(null)
				actions.setHoveredChildIndex(null)
				return
			}

			// Use same logic as parent categories - work with original array directly
			const children = Array.from(parentCategory.children)
			const draggedIndex = state.draggedChildIndex.index

			// Reorder using same logic as parent categories
			const [reorderedItem] = children.splice(draggedIndex, 1)
			children.splice(dropIndex, 0, reorderedItem)
			const targetItem = parentCategory.children[dropIndex]


			// Update children order in the category tree
			const updateCategoryChildren = (cats: Category[]): Category[] => {
				return cats.map((cat) => {
					if (cat.id === parentId) {
						return { ...cat, children }
					}
					if (cat.children && cat.children.length > 0) {
						return { ...cat, children: updateCategoryChildren(cat.children) }
					}
					return cat
				})
			}

			const updatedCategories = updateCategoryChildren(state.categories)

			// Optimistic update
			actions.updateCategories(updatedCategories)
			actions.setDraggedChildIndex(null)
			actions.setHoveredChildIndex(null)

			// API call - pass dropIndex and parentCategory for index-based calculation
			const success = await CategoryApiService.reorderChildCategory(
				reorderedItem,
				targetItem,
				dropIndex, // Pass target index for calculation
				parentCategory, // Pass parentCategory for validation
				async () => {
					if (onReorder) {
						await onReorder()
					} else {
						await queryClient.refetchQueries({ queryKey: ["categories"] })
					}

				},
				async () => {
					// Revert on error
					actions.setCategories(categories)
					if (onReorder) {
						await onReorder()
					} else {
						await queryClient.refetchQueries({ queryKey: ["categories"] })
					}
				}
			)

			if (!success) {
				actions.setCategories(categories)
			}
		},
		[state.isDragEnabled, state.draggedChildIndex, state.categories, categories, actions, onReorder, queryClient]
	)

	const handleChildDragEnter = React.useCallback(
		(e: React.DragEvent, parentId: number, index: number) => {
			if (
				state.isDragEnabled &&
				state.draggedChildIndex !== null &&
				state.draggedChildIndex.parentId === parentId &&
				state.draggedChildIndex.index !== index
			) {
				actions.setHoveredChildIndex({ parentId, index })
			}
		},
		[state.isDragEnabled, state.draggedChildIndex, actions]
	)

	const handleChildDragLeave = React.useCallback(() => {
		actions.setHoveredChildIndex(null)
	}, [actions])

	const handleChildDragEnd = React.useCallback(() => {
		actions.setDraggedChildIndex(null)
		actions.setHoveredChildIndex(null)
	}, [actions])

	// Memoized category items
	const categoryItems = React.useMemo(
		() => {
			// Ensure categories is an array
			const categoriesArray = state.categories
			return categoriesArray.map((category, index) => {
				const isSelected = selectedCategory?.id === category.id
				const isExpanded = state.expandedCategories.has(category.id)
				const isDragged = state.draggedIndex === index
				const isHovered = state.hoveredIndex === index && state.draggedIndex !== null && state.draggedIndex !== index

				return (
					<CategoryItem
						key={category.id}
						category={category}
						index={index}
						level={0}
						isSelected={isSelected}
						isExpanded={isExpanded}
						isDragEnabled={state.isDragEnabled}
						isDragged={isDragged}
						isHovered={isHovered}
						expandedCategories={state.expandedCategories}
						onSelect={handleSelectCategory}
						onToggleExpand={actions.toggleExpanded}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
						onChildDragStart={handleChildDragStart}
						onChildDragEnd={handleChildDragEnd}
						onChildDragOver={handleChildDragOver}
						onChildDrop={handleChildDrop}
						onChildDragEnter={handleChildDragEnter}
						onChildDragLeave={handleChildDragLeave}
						childDraggedIndex={state.draggedChildIndex}
						childHoveredIndex={state.hoveredChildIndex}
					/>
				)
			})
		},
		[
			state.categories,
			state.expandedCategories,
			state.isDragEnabled,
			state.draggedIndex,
			state.hoveredIndex,
			state.draggedChildIndex,
			state.hoveredChildIndex,
			selectedCategory,
			handleSelectCategory,
			actions.toggleExpanded,
			handleDragStart,
			handleDragEnd,
			handleDragOver,
			handleDrop,
			handleDragEnter,
			handleDragLeave,
			handleChildDragStart,
			handleChildDragEnd,
			handleChildDragOver,
			handleChildDrop,
			handleChildDragEnter,
			handleChildDragLeave,
		]
	)

	return (
		<div ref={containerRef} className="w-full" dir="rtl">
			<DragToggleButton isDragEnabled={state.isDragEnabled} onToggle={actions.toggleDragEnabled} />

			<ScrollArea className="w-full h-[calc(100vh-200px)]" dir="rtl">
				<div className="grid grid-cols-1 gap-4 pr-4 min-h-0">
					{categoryItems}
				</div>
			</ScrollArea>
		</div>
	)
}

