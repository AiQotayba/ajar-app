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

	// Update local categories when categories prop changes
	React.useEffect(() => {
		setLocalCategories(categories)
	}, [categories])

	// Handle drag and drop
	const handleDragStart = (index: number, e?: React.DragEvent) => {
		console.info("🔍 [TEST] handleDragStart called", { index, isDragEnabled, draggedIndex })
		if (!isDragEnabled) {
			console.warn("❌ [TEST] Drag not enabled")
			return
		}
		if (e) {
			console.info("🔍 [TEST] Drag event details", {
				type: e.type,
				target: e.target,
				currentTarget: e.currentTarget,
				dataTransfer: {
					effectAllowed: e.dataTransfer.effectAllowed,
					types: Array.from(e.dataTransfer.types)
				}
			})
		}
		console.info("✅ [TEST] Drag started for index:", index)
		setDraggedIndex(index)
	}

	const handleDragOver = (e: React.DragEvent, index: number) => {
		if (!isDragEnabled) {
			console.warn("🔍 [TEST] handleDragOver - drag not enabled")
			return
		}
		console.info("🔍 [TEST] handleDragOver", { index, draggedIndex, hoveredIndex })
		e.preventDefault()
		e.stopPropagation()
		if (draggedIndex !== null && draggedIndex !== index) {
			setHoveredIndex(index)
		}
	}

	const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
		console.info("🔍 [TEST] handleDrop called", { dropIndex, isDragEnabled, draggedIndex })
		if (!isDragEnabled) {
			console.warn("❌ [TEST] handleDrop - drag not enabled")
			return
		}
		e.preventDefault()
		e.stopPropagation()

		if (draggedIndex === null) {
			console.warn("❌ [TEST] handleDrop - draggedIndex is null")
			setDraggedIndex(null)
			return
		}

		if (draggedIndex === dropIndex) {
			console.info("ℹ️ [TEST] handleDrop - same index, no change needed")
			setDraggedIndex(null)
			return
		}

		console.info("✅ [TEST] Processing drop", { from: draggedIndex, to: dropIndex })

		const items = Array.from(localCategories)
		const [reorderedItem] = items.splice(draggedIndex, 1)
		items.splice(dropIndex, 0, reorderedItem)

		// Get the target item (the one we dropped on)
		const targetItem = localCategories[dropIndex]

		console.info("🔍 [TEST] Reordered items", {
			reorderedItem: { id: reorderedItem.id, name: reorderedItem.name },
			targetItem: { id: targetItem.id, sort_order: targetItem.sort_order },
			newOrder: items.map((item, idx) => ({ idx, id: item.id, name: item.name }))
		})

		// Update local state immediately for better UX
		setLocalCategories(items)
		setDraggedIndex(null)
		setHoveredIndex(null)

		try {
			// Call API to update sort order on server
			console.info(`🔄 [TEST] Updating sort order for category ${reorderedItem.id} to position of category ${targetItem.id}`)

			const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, {
				sort_order: targetItem.sort_order,
			})

			console.info("✅ [TEST] Sort order update response:", response)
			toast.success("تم تحديث ترتيب التصنيف بنجاح")

			// Call onReorder callback to refetch categories
			if (onReorder) {
				onReorder()
			}
		} catch (error: any) {
			console.error("❌ [TEST] Error updating sort order:", error)

			// Show more specific error message
			const errorMessage = error?.response?.data?.message || error?.message || "فشل في تحديث الترتيب"
			toast.error(errorMessage)

			// Revert local changes on error
			setLocalCategories(categories)
			if (onReorder) {
				onReorder()
			}
		}
	}

	const handleDragEnd = (e?: React.DragEvent) => {
		console.info("🔍 [TEST] handleDragEnd called", { draggedIndex, hoveredIndex })
		if (e) {
			console.info("🔍 [TEST] DragEnd event details", {
				type: e.type,
				dataTransfer: {
					dropEffect: e.dataTransfer.dropEffect,
					effectAllowed: e.dataTransfer.effectAllowed
				}
			})
		}
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
			const [isExpanded, setIsExpanded] = React.useState(false)

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
							"flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors",
							isSelected && "text-primary font-semibold bg-primary/5"
						)}
						onClick={() => {
							onSelectCategory(category)
						}}
					>
						<div className="flex items-center gap-2 flex-1 text-right">
							<Button variant="ghost" size="icon" className="hover:bg-transparent cursor-pointer p-0" onClick={() => hasChildren && setIsExpanded(!isExpanded)} disabled={!hasChildren}>
								{renderCategoryIcon(category.icon, isExpanded)}
							</Button>
							<span className="font-medium">{category.name.ar || category.name.en}</span>
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
					console.info("🔍 [TEST] AccordionItem onDragStart", { index, isDragEnabled, level })
					// Allow drag to propagate to handle
				}}
				onDragOver={(e) => {
					console.info("🔍 [TEST] AccordionItem onDragOver", { index, isDragEnabled, level, draggedIndex })
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
					console.info("🔍 [TEST] AccordionItem onDrop", { index, isDragEnabled, level, draggedIndex })
					if (isDragEnabled && level === 0 && index !== undefined) {
						e.preventDefault()
						e.stopPropagation()
						console.info("🎯 [TEST] Drop event on AccordionItem for index:", index)
						handleDrop(e, index)
					}
				}}
				onDragEnter={(e) => {
					console.info("🔍 [TEST] AccordionItem onDragEnter", { index, isDragEnabled, level, draggedIndex })
					if (isDragEnabled && level === 0 && index !== undefined && draggedIndex !== null && draggedIndex !== index) {
						e.preventDefault()
						e.stopPropagation()
						setHoveredIndex(index)
					}
				}}
				onDragLeave={(e) => {
					console.info("🔍 [TEST] AccordionItem onDragLeave", { index, isDragEnabled, level })
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
						console.info("🔍 [TEST] AccordionTrigger onClick", { isDragEnabled, index })
						// Don't trigger select if drag is enabled
						if (!isDragEnabled) {
							onSelectCategory(category)
						} else {
							// Prevent accordion toggle when drag is enabled
							e.preventDefault()
							e.stopPropagation()
						}
					}}
					onMouseDown={(e) => {
						// Prevent accordion toggle when drag is enabled
						if (isDragEnabled && level === 0) {
							console.info("🔍 [TEST] AccordionTrigger onMouseDown - drag enabled", { index })
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
									console.info("🔍 [TEST] Drag handle onDragStart", { index, isDragEnabled, level })
									e.stopPropagation()
									if (index !== undefined) {
										e.dataTransfer.effectAllowed = "move"
										e.dataTransfer.setData("text/plain", index.toString())
										e.dataTransfer.setData("application/json", JSON.stringify({ index, categoryId: category.id }))
										console.info("🔍 [TEST] Drag handle - dataTransfer set", {
											effectAllowed: e.dataTransfer.effectAllowed,
											types: Array.from(e.dataTransfer.types)
										})
										handleDragStart(index, e)
									} else {
										console.warn("❌ [TEST] Drag handle - index is undefined")
									}
								}}
								onDragEnd={(e) => {
									console.info("🔍 [TEST] Drag handle onDragEnd", { index })
									e.stopPropagation()
									handleDragEnd(e)
								}}
								onMouseDown={(e) => {
									console.info("🔍 [TEST] Drag handle onMouseDown", { index, isDragEnabled })
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
							<span className="font-medium">{category.name.ar || category.name.en}</span>
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
		<div className="max-w-4xl mx-auto" dir="rtl">
			{/* Drag & Drop Toggle Button */}
			<div className="flex justify-end mb-4">
				<Button
					variant={isDragEnabled ? "default" : "outline"}
					size="sm"
					onClick={() => {
						const newState = !isDragEnabled
						console.info("🔍 [TEST] Toggling drag mode", { 
							from: isDragEnabled, 
							to: newState,
							categoriesCount: localCategories.length 
						})
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
