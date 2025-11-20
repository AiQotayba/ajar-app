"use client"

import * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Folder, FolderOpen, ChevronRight, GripVertical } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { cn } from "@/lib/utils"
import Images from "@/components/ui/image"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api-client"
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
	const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
	const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
	const [localCategories, setLocalCategories] = React.useState<Category[]>(categories)
	const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set())
	const queryClient = useQueryClient()
	const containerRef = React.useRef<HTMLDivElement>(null)

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

		} catch (error: any) {
			// Show more specific error message
			const errorMessage = error?.response?.data?.message || error?.message || "فشل في تحديث الترتيب"
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
		setDraggedIndex(null)
		setHoveredIndex(null)
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

	const CategoryItem = ({ category, level = 0, index }: { category: Category; level?: number; index?: number }) => {
		const hasChildren = category.children && category.children.length > 0
		const isSelected = selectedCategory?.id === category.id
		const itemId = `category-${category.id}-${level}`

		// للفئات الفرعية (level > 0)، نستخدم عرض بسيط بدون Accordion
		if (level > 0) {
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

			return (
				<div
					className={cn(
						"border rounded-lg mb-2 transition-colors",
						isSelected && "bg-primary/5 border-primary/20"
					)}
				// style={{ marginRight: `${level * 1}rem` }}
				>
					<div
						className={cn(
							"flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
							isSelected && "bg-primary/5"
						)}
					>
						<div className="flex items-center gap-2 flex-1 text-right">
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
							>
								{renderCategoryIcon(category.icon, isExpanded)}
							</Button>
							<span 
								className={cn(
									"font-medium cursor-pointer hover:text-primary transition-colors",
									isSelected && "text-primary font-semibold"
								)}
								onClick={(e) => {
									// منع انتشار الحدث إلى العناصر الأب لمنع العودة للأعلى
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
					{hasChildren && isExpanded && (
						<div className="px-4 pb-3 space-y-2">
							{category.children.map((child) => (
								<CategoryItem key={child.id} category={child} level={level + 1} />
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
					onMouseDown={(e) => {
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
						<div className="flex items-center gap-2">
							{renderCategoryIcon(category.icon, hasChildren)}
							<span 
								className={cn(
									"font-medium cursor-pointer hover:text-primary transition-colors",
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
							{category.children.map((child) => (
								<CategoryItem key={child.id} category={child} level={level + 1} />
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
						setIsDragEnabled(newState)
						// Reset drag state when disabling
						if (!newState) {
							setDraggedIndex(null)
							setHoveredIndex(null)
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
