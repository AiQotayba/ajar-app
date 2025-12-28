"use client"

import * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Folder, FolderOpen, ChevronRight, GripVertical, } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { cn } from "@/lib/utils"
import Images from "@/components/ui/image"
import { Button } from "@/components/ui/button"
import { api, ApiResponse } from "@/lib/api-client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query" 

interface CategoriesAccordionProps {
	categories: Category[]
	onSelectCategory: (category: Category | null) => void
	selectedCategory: Category | null
	onReorder?: () => void // Callback to refetch categories after reorder
}

const urlEndpoint = "/admin/categories"

export function CategoriesAccordion({ categories, onSelectCategory, selectedCategory, onReorder }: CategoriesAccordionProps) {
	const [isDragEnabled, setIsDragEnabled] = React.useState(false)
	
	// Debug: Log isDragEnabled changes
	React.useEffect(() => {
		console.info("🔄 [isDragEnabled changed]", { isDragEnabled })
	}, [isDragEnabled])
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
	const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
	const [localCategories, setLocalCategories] = React.useState<Category[]>(categories)
	const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set())
	const queryClient = useQueryClient()
	const containerRef = React.useRef<HTMLDivElement>(null)
	
	// Drag and drop states for child categories - using same pattern as parent
	const [draggedChildIndex, setDraggedChildIndex] = React.useState<{ parentId: number; index: number } | null>(null)
	const [hoveredChildIndex, setHoveredChildIndex] = React.useState<{ parentId: number; index: number } | null>(null)

	// دالة لحفظ موضع الـ scroll واستعادته بعد استدعاء onSelectCategory
	const handleSelectCategoryWithScrollPreservation = React.useCallback((category: Category, event?: React.MouseEvent) => {
		// البحث عن جميع العناصر القابلة للتمرير وحفظ مواضعها
		const scrollPositions: Array<{ element: HTMLElement, top: number, left: number }> = []

		// البحث في جميع العناصر القابلة للتمرير
		const findAllScrollContainers = (element: HTMLElement | null): HTMLElement[] => {
			const containers: HTMLElement[] = []
			let current: HTMLElement | null = element

			while (current && current !== document.body && current !== document.documentElement) {
				const style = window.getComputedStyle(current)
				if (style.overflow === 'auto' || style.overflow === 'scroll' ||
					style.overflowY === 'auto' || style.overflowY === 'scroll' ||
					style.overflowX === 'auto' || style.overflowX === 'scroll') {
					containers.push(current)
				}
				current = current.parentElement
			}

			// إضافة window scroll أيضاً
			if (window.scrollY > 0 || window.scrollX > 0) {
				containers.push(document.documentElement)
			}

			return containers
		}

		// حفظ مواضع الـ scroll
		const startElement = event?.currentTarget as HTMLElement || containerRef.current
		const scrollContainers = findAllScrollContainers(startElement)

		scrollContainers.forEach(container => {
			scrollPositions.push({
				element: container,
				top: container.scrollTop,
				left: container.scrollLeft
			})
		})

		// حفظ موضع window scroll أيضاً
		const windowScroll = {
			top: window.scrollY || window.pageYOffset || 0,
			left: window.scrollX || window.pageXOffset || 0
		}

		// استدعاء onSelectCategory
		onSelectCategory(category)

		// إعادة مواضع الـ scroll بعد re-render باستخدام عدة محاولات
		const restoreScroll = () => {
			// استعادة مواضع الـ scroll المحلية
			scrollPositions.forEach(({ element, top, left }) => {
				try {
					if (element && (element.scrollTop !== top || element.scrollLeft !== left)) {
						element.scrollTop = top
						element.scrollLeft = left
					}
				} catch (e) {
					console.log(e)
					// تجاهل الأخطاء
				}
			})

			// استعادة موضع window scroll
			const currentWindowTop = window.scrollY || window.pageYOffset || 0
			const currentWindowLeft = window.scrollX || window.pageXOffset || 0
			if (Math.abs(currentWindowTop - windowScroll.top) > 1 || Math.abs(currentWindowLeft - windowScroll.left) > 1) {
				window.scrollTo(windowScroll.left, windowScroll.top)
			}
		}

		// محاولة استعادة الـ scroll عدة مرات للتأكد
		requestAnimationFrame(() => {
			restoreScroll()
			requestAnimationFrame(() => {
				restoreScroll()
				setTimeout(() => {
					restoreScroll()
				}, 10)
			})
		})
	}, [onSelectCategory])

	// Update local categories when categories prop changes
	React.useEffect(() => {
		if (categories && categories.length > 0) {
			setLocalCategories(categories)
		}
	}, [categories])

	// Handle drag and drop
	const handleDragStart = (index: number, e?: React.DragEvent) => {
		console.log(e)
		if (!isDragEnabled) {
			return
		}
		setDraggedIndex(index)
	}

	const handleDragOver = (e: React.DragEvent, index: number) => {
		if (!isDragEnabled) return;
		e.preventDefault()
		e.stopPropagation()
		if (draggedIndex !== null && draggedIndex !== index) {
			setHoveredIndex(index)
		}
	}

	const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
		if (!isDragEnabled) {
			return
		}
		e.preventDefault()
		e.stopPropagation()

		if (draggedIndex === null) {
			setDraggedIndex(null)
			return
		}

		if (draggedIndex === dropIndex) {
			setDraggedIndex(null)
			return
		}


		const items = Array.from(localCategories)
		const [reorderedItem] = items.splice(draggedIndex, 1)
		items.splice(dropIndex, 0, reorderedItem)

		// Get the target item (the one we dropped on)
		const targetItem = localCategories[dropIndex]

		// Update local state immediately for better UX
		setLocalCategories(items)
		setDraggedIndex(null)
		setHoveredIndex(null)

		try {
			// Call API to update sort order on server
			const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, {
				sort_order: targetItem.id,
			})

			if (response.isError) {
				toast.error(response.message || "فشل في تحديث الترتيب")
				// Revert local changes on error
				setLocalCategories(categories)
				// Refetch to get latest data
				if (onReorder) {
					await onReorder()
				} else {
					await queryClient.refetchQueries({ queryKey: ["categories"] })
				}
				return
			}

			toast.success("تم تحديث ترتيب التصنيف بنجاح")

			// Call onReorder callback to refetch categories (preferred method)
			// Use await to ensure data is refetched before continuing
			if (onReorder) {
				await onReorder()
			} else {
				// Fallback to refetch if onReorder not provided
				await queryClient.refetchQueries({ queryKey: ["categories"] })
			}

		} catch (error) {
			// Show more specific error message
			const errorMessage = (error as ApiResponse<Category>)?.message || "فشل في تحديث الترتيب"
			toast.error(errorMessage)

			// Revert local changes on error
			setLocalCategories(categories)

			// Refetch to get latest data
			if (onReorder) {
				await onReorder()
			} else {
				await queryClient.refetchQueries({ queryKey: ["categories"] })
			}
		}
	}

	const handleDragEnd = (e?: React.DragEvent) => {
		console.log(e)
		setDraggedIndex(null)
		setHoveredIndex(null)
		setDraggedChildIndex(null)
		setHoveredChildIndex(null)
	}

	// Child category drag and drop handlers - same pattern as parent
	const handleChildDragStart = (parentId: number, index: number) => {
		console.info("🔵 [Child Drag Start]", { parentId, index, isDragEnabled })
		if (!isDragEnabled) {
			console.warn("⚠️ [Child Drag Start] Drag is not enabled")
			return
		}
		setDraggedChildIndex({ parentId, index })
		console.info("✅ [Child Drag Start] State updated", { parentId, index })
	}


	const handleChildDrop = async (e: React.DragEvent, parentId: number, dropIndex: number) => {
		console.info("🟢 [Child Drop]", { parentId, dropIndex, draggedChildIndex, isDragEnabled })
		if (!isDragEnabled) {
			console.warn("⚠️ [Child Drop] Drag is not enabled")
			return
		}
		e.preventDefault()
		e.stopPropagation()

		if (draggedChildIndex === null) {
			console.warn("⚠️ [Child Drop] No dragged item")
			setDraggedChildIndex(null)
			return
		}

		// Only allow reordering within the same parent
		if (draggedChildIndex.parentId !== parentId) {
			console.warn("⚠️ [Child Drop] Different parent", { 
				draggedParentId: draggedChildIndex.parentId, 
				dropParentId: parentId 
			})
			setDraggedChildIndex(null)
			setHoveredChildIndex(null)
			return
		}

		if (draggedChildIndex.index === dropIndex) {
			console.warn("⚠️ [Child Drop] Same index", { index: dropIndex })
			setDraggedChildIndex(null)
			setHoveredChildIndex(null)
			return
		}
		
		console.info("✅ [Child Drop] Proceeding with reorder", {
			fromIndex: draggedChildIndex.index,
			toIndex: dropIndex,
			parentId
		})

		// Find parent category and update its children
		const updateCategoryChildren = (cats: Category[]): Category[] => {
			return cats.map(cat => {
				if (cat.id === parentId && cat.children) {
					const children = Array.from(cat.children)
					const [reorderedItem] = children.splice(draggedChildIndex.index, 1)
					children.splice(dropIndex, 0, reorderedItem)
					return { ...cat, children }
				}
				if (cat.children && cat.children.length > 0) {
					return { ...cat, children: updateCategoryChildren(cat.children) }
				}
				return cat
			})
		}

		// Get target child for sort_order
		const findParentCategory = (cats: Category[]): Category | null => {
			for (const cat of cats) {
				if (cat.id === parentId) return cat
				if (cat.children && cat.children.length > 0) {
					const found = findParentCategory(cat.children)
					if (found) return found
				}
			}
			return null
		}

		const parentCategory = findParentCategory(localCategories)
		if (!parentCategory || !parentCategory.children) {
			setDraggedChildIndex(null)
			setHoveredChildIndex(null)
			return
		}

		// Get the target item (the one we dropped on)
		const targetItem = parentCategory.children[dropIndex]
		const reorderedItem = parentCategory.children[draggedChildIndex.index]

		// Update local state immediately for better UX
		const updatedCategories = updateCategoryChildren(localCategories)
		setLocalCategories(updatedCategories)
		setDraggedChildIndex(null)
		setHoveredChildIndex(null)

		try {
			// Call API to update sort order on server
			const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, {
				sort_order: targetItem.id,
			})

			if (response.isError) {
				toast.error(response.message || "فشل في تحديث ترتيب الفئة الفرعية")
				// Revert local changes on error
				setLocalCategories(categories)
				// Refetch to get latest data
				if (onReorder) {
					await onReorder()
				} else {
					await queryClient.refetchQueries({ queryKey: ["categories"] })
				}
				return
			}

			toast.success("تم تحديث ترتيب الفئة الفرعية بنجاح")

			// Call onReorder callback to refetch categories (preferred method)
			if (onReorder) {
				await onReorder()
			} else {
				// Fallback to refetch if onReorder not provided
				await queryClient.refetchQueries({ queryKey: ["categories"] })
			}
		} catch (error: unknown) {
			// Show more specific error message
			const errorMessage = (error as ApiResponse<Category>)?.message || "فشل في تحديث ترتيب الفئة الفرعية"
			toast.error(errorMessage)

			// Revert local changes on error
			setLocalCategories(categories)

			// Refetch to get latest data
			if (onReorder) {
				await onReorder()
			} else {
				await queryClient.refetchQueries({ queryKey: ["categories"] })
			}
		}
	}

	const handleChildDragEnd = (e?: React.DragEvent) => {
		console.log(e)
		setDraggedChildIndex(null)
		setHoveredChildIndex(null)
	}

	const renderCategoryIcon = (icon: string | null | undefined, hasChildren: boolean) => {
		if (icon) {
			const iconUrl = icon.startsWith('http')
				? icon
				: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${icon}`
			return (
				<Images
					src={iconUrl}
					alt=""
					fill={false}
					width={20}
					height={20}
					className="w-5 h-5 object-cover rounded flex-shrink-0"
					onError={(e) => {
						e.currentTarget.style.display = 'none'
					}}
				/>
			)
		}
		return hasChildren
			? <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
			: <Folder className="w-5 h-5 fill-primary text-primary flex-shrink-0" />

	}

	const CategoryItem = ({ category, level = 0, index, parentId: providedParentId }: { category: Category; level?: number; index?: number; parentId?: number }) => {
		const hasChildren = category.children && category.children.length > 0
		const isSelected = selectedCategory?.id === category.id
		const itemId = `category-${category.id}-${level}`

		// Debug: Check if isDragEnabled is accessible in CategoryItem
		if (level > 0) {
			console.info("🔎 [CategoryItem] isDragEnabled check", {
				categoryName: category.name.ar || category.name.en,
				level,
				isDragEnabled: typeof isDragEnabled !== 'undefined' ? isDragEnabled : 'UNDEFINED',
				providedParentId,
				index
			})
		}

		// للفئات الفرعية (level > 0)، نستخدم عرض بسيط بدون Accordion
		if (level > 0 && providedParentId !== undefined && index !== undefined) {
			// Use provided parentId and index directly - they should always be provided for children
			const parentId = providedParentId
			const childIndex = index
			
			// Check if drag is enabled for this child
			const canDrag = isDragEnabled && parentId > 0 && childIndex >= 0
			
			// Debug: Log drag state for children - check if isDragEnabled is accessible
			console.info("🔍 [Child Render]", {
				categoryName: category.name.ar || category.name.en,
				categoryId: category.id,
				level,
				parentId,
				childIndex,
				providedParentId,
				index,
				isDragEnabled: typeof isDragEnabled !== 'undefined' ? isDragEnabled : 'UNDEFINED',
				canDrag,
				parentIdValid: parentId > 0,
				childIndexValid: childIndex >= 0,
				reason: !isDragEnabled ? 'isDragEnabled is false' : (parentId <= 0 ? 'parentId <= 0' : (childIndex < 0 ? 'childIndex < 0' : 'OK'))
			})
			
			const isExpanded = expandedCategories.has(category.id)

			const toggleExpanded = (e?: React.MouseEvent) => {
				// حفظ موضع الـ scroll قبل toggle
				const scrollPositions: Array<{ element: HTMLElement, top: number, left: number }> = []

				// البحث عن جميع العناصر القابلة للتمرير
				const findAllScrollContainers = (element: HTMLElement | null): HTMLElement[] => {
					const containers: HTMLElement[] = []
					let current: HTMLElement | null = element

					while (current && current !== document.body && current !== document.documentElement) {
						const style = window.getComputedStyle(current)
						if (style.overflow === 'auto' || style.overflow === 'scroll' ||
							style.overflowY === 'auto' || style.overflowY === 'scroll' ||
							style.overflowX === 'auto' || style.overflowX === 'scroll') {
							containers.push(current)
						}
						current = current.parentElement
					}

					if (window.scrollY > 0 || window.scrollX > 0) {
						containers.push(document.documentElement)
					}

					return containers
				}

				const startElement = e?.currentTarget as HTMLElement || containerRef.current
				const scrollContainers = findAllScrollContainers(startElement)

				scrollContainers.forEach(container => {
					scrollPositions.push({
						element: container,
						top: container.scrollTop,
						left: container.scrollLeft
					})
				})

				const windowScroll = {
					top: window.scrollY || window.pageYOffset || 0,
					left: window.scrollX || window.pageXOffset || 0
				}

				// تنفيذ toggle
				setExpandedCategories(prev => {
					const newSet = new Set(prev)
					if (newSet.has(category.id)) {
						newSet.delete(category.id)
					} else {
						newSet.add(category.id)
					}
					return newSet
				})

				// استعادة موضع الـ scroll بعد re-render
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						scrollPositions.forEach(({ element, top, left }) => {
							try {
								if (element && (element.scrollTop !== top || element.scrollLeft !== left)) {
									element.scrollTop = top
									element.scrollLeft = left
								}
							} catch (err) {
								console.log(err)
								// تجاهل الأخطاء
							}
						})

						const currentWindowTop = window.scrollY || window.pageYOffset || 0
						const currentWindowLeft = window.scrollX || window.pageXOffset || 0
						if (Math.abs(currentWindowTop - windowScroll.top) > 1 || Math.abs(currentWindowLeft - windowScroll.left) > 1) {
							window.scrollTo(windowScroll.left, windowScroll.top)
						}
					})
				})
			}

			const isDragged = canDrag && draggedChildIndex?.parentId === parentId && draggedChildIndex?.index === childIndex
			const isHovered = canDrag && hoveredChildIndex?.parentId === parentId && hoveredChildIndex?.index === childIndex && draggedChildIndex !== null && draggedChildIndex.index !== childIndex

			// Shared drag handlers for both outer and inner divs
			const handleDragOver = (e: React.DragEvent) => {
				// MUST call preventDefault ALWAYS to allow drop - this is critical for drag to work
				// Without preventDefault, drop events won't fire
				console.info("🟡 [Child onDragOver - BEFORE]", { 
					isDragEnabled, 
					level, 
					parentId, 
					childIndex, 
					draggedChildIndex,
					canDrag 
				})
				
				// Always prevent default for child categories to allow drop
				if (level > 0) {
					e.preventDefault()
					e.stopPropagation()
					
					if (isDragEnabled) {
						e.dataTransfer.dropEffect = "move"
						console.info("🟡 [Child onDragOver - AFTER]", { canDrag, parentId, childIndex, draggedChildIndex, isDragEnabled, hasDraggedItem: draggedChildIndex !== null })
						// Update hover state if we have a dragged item and it's different from current
						if (draggedChildIndex !== null && draggedChildIndex.parentId === parentId && draggedChildIndex.index !== childIndex) {
							setHoveredChildIndex({ parentId, index: childIndex })
						}
					} else {
						e.dataTransfer.dropEffect = "none"
						console.warn("⚠️ [Child onDragOver] Drag not enabled", { isDragEnabled, level })
					}
				}
			}

			const handleDrop = (e: React.DragEvent) => {
				console.info("🟢 [Child onDrop]", { canDrag, parentId, childIndex, draggedChildIndex, isDragEnabled })
				if (canDrag) {
					e.preventDefault()
					e.stopPropagation()
					handleChildDrop(e, parentId, childIndex)
				} else {
					console.warn("⚠️ [Child onDrop] canDrag is false", { canDrag, isDragEnabled, parentId, childIndex })
				}
			}

			const handleDragEnter = (e: React.DragEvent) => {
				console.info("🟠 [Child onDragEnter]", { canDrag, parentId, childIndex, draggedChildIndex, isDragEnabled })
				if (isDragEnabled && level > 0) {
					e.preventDefault()
					e.stopPropagation()
					if (canDrag && draggedChildIndex !== null && draggedChildIndex.index !== childIndex) {
						setHoveredChildIndex({ parentId, index: childIndex })
					}
				}
			}

			const handleDragLeave = (e: React.DragEvent) => {
				if (canDrag) {
					// Only clear hover if we're actually leaving the element (not just moving to a child)
					const rect = e.currentTarget.getBoundingClientRect()
					const x = e.clientX
					const y = e.clientY
					if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
						setHoveredChildIndex(null)
					}
				}
			}

			return (
				<div
					className={cn(
						"rounded-lg mb-2 transition-all duration-200",
						isSelected && "bg-primary/5 border-primary/20",
						isDragged && "opacity-50 scale-95",
						isHovered && "border-primary border-2 bg-primary/10 scale-[1.02]"
					)}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
				>
					<div
						className={cn(
							"flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
							isSelected && "bg-primary/5"
						)}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onDragEnter={handleDragEnter}
					>
						<div className="flex items-center gap-2 flex-1 text-right">
							{canDrag ? (
								<div
									draggable={true}
									onDragStart={(e) => {
										console.info("🟣 [Child Element onDragStart]", { parentId, childIndex, categoryId: category.id })
										e.stopPropagation()
										e.dataTransfer.effectAllowed = "move"
										e.dataTransfer.setData("text/plain", childIndex.toString())
										e.dataTransfer.setData("application/json", JSON.stringify({ index: childIndex, parentId, categoryId: category.id }))
										handleChildDragStart(parentId, childIndex)
									}}
									onDragEnd={(e) => {
										console.info("🔴 [Child Element onDragEnd]")
										e.stopPropagation()
										handleChildDragEnd(e)
									}}
									onDragOver={(e) => {
										// Allow drop on the drag handle itself
										e.preventDefault()
										e.stopPropagation()
										e.dataTransfer.dropEffect = "move"
									}}
									onMouseDown={(e) => {
										// Prevent click events when starting drag
										if (isDragEnabled) {
											e.stopPropagation()
										}
									}}
									className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
									style={{ userSelect: 'none' }}
								>
									<GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors pointer-events-none" />
								</div>
							) : (
								<div className="text-xs text-muted-foreground">
									{/* {!isDragEnabled && "❌ Drag disabled"} */}
									{/* {isDragEnabled && parentId === 0 && "❌ No parentId"} */}
									{/* {isDragEnabled && parentId > 0 && childIndex < 0 && "❌ Invalid index"} */}
								</div>
							)}
							<Button
								variant="ghost"
								size="icon"
								className="hover:bg-transparent cursor-pointer p-0"
								onClick={(e) => {
									// منع السلوك الافتراضي والانتشار لمنع العودة للأعلى
									e.preventDefault()
									e.stopPropagation()
									if (hasChildren) {
										toggleExpanded(e)
									}
								}}
								disabled={!hasChildren}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								onDragEnter={handleDragEnter}
							>
								{renderCategoryIcon(category.icon, isExpanded)}
							</Button>
						</div>
						<span
							className={cn(
								"font-medium cursor-pointer hover:text-primary transition-colors w-full",
								isSelected && "text-primary font-semibold"
							)}
							onClick={(e) => {
								// منع انتشار الحدث إلى العناصر الأب لمنع العودة للأعلى
								e.stopPropagation()
								// استخدام دالة حفظ موضع الـ scroll
								handleSelectCategoryWithScrollPreservation(category, e)
							}}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							onDragEnter={handleDragEnter}
						>
							{category.name.ar || category.name.en}
						</span>
						{category.children.length > 0 && (
							<Button variant="ghost" size="icon"
								onClick={(e) => {
									// منع السلوك الافتراضي والانتشار لمنع العودة للأعلى
									e.preventDefault()
									e.stopPropagation()
									if (hasChildren) {
										toggleExpanded(e)
									}
								}}
								disabled={!hasChildren}
								className="hover:bg-transparent cursor-pointer p-0"
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								onDragEnter={handleDragEnter}
							>
								<ChevronRight className={cn("w-5 h-5 text-primary flex-shrink-0", isExpanded ? "rotate-90" : "rotate-0")} />
							</Button>
						)}
					</div>
					{hasChildren && isExpanded && (
						<div className="px-4 pb-3 space-y-2">
							{category.children.map((child, idx) => (
								<CategoryItem key={child.id} category={child} level={level + 1} index={idx} parentId={category.id} />
							))}
						</div>
					)}
				</div>
			)
		}

		// للفئات الرئيسية (level === 0)، نستخدم Accordion
		return (
			<AccordionItem
				value={itemId}
				className={cn(
					"border rounded-lg mb-2 transition-all duration-200",
					isSelected && "bg-primary/5 border-primary/20",
					draggedIndex !== null && draggedIndex === index && "opacity-50 scale-95",
					hoveredIndex === index && draggedIndex !== null && draggedIndex !== index && "border-primary border-2 bg-primary/10 scale-[1.02]"
				)}
				onDragStart={(e) => {
					console.log(e)
					// Allow drag to propagate to handle
				}}
				onDragOver={(e) => {
					if (isDragEnabled && level === 0 && index !== undefined) {
						e.preventDefault()
						e.stopPropagation()
						e.dataTransfer.dropEffect = "move"
						// Always call handleDragOver to update hover state
						if (draggedIndex !== null && draggedIndex !== index) {
							handleDragOver(e, index)
						}
					}
				}}
				onDrop={(e) => {
					if (isDragEnabled && level === 0 && index !== undefined) {
						e.preventDefault()
						e.stopPropagation()
						handleDrop(e, index)
					}
				}}
				onDragEnter={(e) => {
					if (isDragEnabled && level === 0 && index !== undefined && draggedIndex !== null && draggedIndex !== index) {
						e.preventDefault()
						e.stopPropagation()
						setHoveredIndex(index)
					}
				}}
				onDragLeave={(e) => {
					if (isDragEnabled && level === 0 && index !== undefined) {
						// Only clear hover if we're actually leaving the element (not just moving to a child)
						const rect = e.currentTarget.getBoundingClientRect()
						const x = e.clientX
						const y = e.clientY
						if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
							setHoveredIndex(null)
						}
					}
				}}
			>
				<AccordionTrigger
					className={cn(
						"hover:no-underline px-4 py-3 w-full",
						isSelected && "text-primary font-semibold"
					)}
					onClick={(e) => {
						// منع انتشار الحدث لمنع العودة للأعلى
						e.stopPropagation()

						// Prevent accordion toggle when drag is enabled
						if (isDragEnabled) {
							e.preventDefault()
						}
					}}
					onMouseDown={() => { 
						// Prevent accordion toggle when drag is enabled
						if (isDragEnabled && level === 0) {
							// Don't prevent default, let drag handle it
						}
					}}
					asChild={false}
				>
					<div className="flex items-center gap-3 flex-1 text-right w-full">
						{isDragEnabled && level === 0 ? (
							<div
								draggable={true}
								onDragStart={(e) => {
									e.stopPropagation()
									if (index !== undefined) {
										e.dataTransfer.effectAllowed = "move"
										e.dataTransfer.setData("text/plain", index.toString())
										e.dataTransfer.setData("application/json", JSON.stringify({ index, categoryId: category.id }))
										handleDragStart(index, e)
									}
								}}
								onDragEnd={(e) => {
									e.stopPropagation()
									handleDragEnd(e)
								}}
								onMouseDown={(e) => {
									// Prevent accordion toggle when starting drag
									if (isDragEnabled) {
										e.stopPropagation()
									}
								}}
								className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
								style={{ userSelect: 'none' }}
							>
								<GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors pointer-events-none" />
							</div>
						) : null}
						<div className="flex items-center gap-2 w-full">
							{renderCategoryIcon(category.icon, hasChildren)}
							<span
								className={cn(
									"font-medium cursor-pointer hover:text-primary transition-colors w-full",
									isSelected && "text-primary font-semibold"
								)}
								onClick={(e) => {
									// منع انتشار الحدث لمنع العودة للأعلى
									e.stopPropagation()
									// استخدام دالة حفظ موضع الـ scroll
									handleSelectCategoryWithScrollPreservation(category, e)
								}}
							>
								{category.name.ar || category.name.en}
							</span>
						</div>
						{hasChildren && (
							<span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
								{category.children.length}
							</span>
						)}
					</div>
				</AccordionTrigger>

				{hasChildren && (
					<AccordionContent className="px-4 pb-3">
						<div className="space-y-2 mt-2">
							{category.children.map((child, idx) => (
								<CategoryItem key={child.id} category={child} level={level + 1} index={idx} parentId={category.id} />
							))}
						</div>
					</AccordionContent>
				)}
			</AccordionItem>
		)
	}

	return (
		<div ref={containerRef} className="max-w-4xl mx-auto" dir="rtl">
			{/* Drag & Drop Toggle Button */}
			<div className="flex justify-end mb-4">
				<Button
					variant={isDragEnabled ? "default" : "outline"}
					size="sm"
					onClick={() => {
						const newState = !isDragEnabled
						console.info("🔄 [Toggle Drag]", { oldState: isDragEnabled, newState })
						setIsDragEnabled(newState)
					// Reset drag state when disabling
					if (!newState) {
						setDraggedIndex(null)
						setHoveredIndex(null)
						setDraggedChildIndex(null)
						setHoveredChildIndex(null)
					}
					}}
					className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
				>
					<GripVertical className="h-4 w-4" />
					<span>{isDragEnabled ? "تعطيل السحب والإفلات" : "تفعيل السحب والإفلات"}</span>
				</Button>
			</div>

			<Accordion type="multiple" className="w-full">
				{localCategories.map((category, index) => (
					<CategoryItem key={category.id} category={category} index={index} />
				))}
			</Accordion>
		</div>
	)
}
