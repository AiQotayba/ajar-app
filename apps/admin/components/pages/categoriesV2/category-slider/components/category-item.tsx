import * as React from "react"
import { ChevronRight, GripVertical } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "./category-icon"
import { CategoryChildItem } from "./category-child-item"

interface CategoryItemProps {
	category: Category
	index: number
	level: number
	isSelected: boolean
	isExpanded: boolean
	isDragEnabled: boolean
	isDragged: boolean
	isHovered: boolean
	expandedCategories: Set<number>
	onSelect: (category: Category, event?: React.MouseEvent) => void
	onToggleExpand: (id: number) => void
	onDragStart: (index: number, e: React.DragEvent) => void
	onDragEnd: () => void
	onDragOver: (e: React.DragEvent, index: number) => void
	onDrop: (e: React.DragEvent, index: number) => void
	onDragEnter: (e: React.DragEvent, index: number) => void
	onDragLeave: (e: React.DragEvent) => void
	// Child drag handlers
	onChildDragStart: (parentId: number, index: number, e: React.DragEvent) => void
	onChildDragEnd: () => void
	onChildDragOver: (e: React.DragEvent, parentId: number, index: number) => void
	onChildDrop: (e: React.DragEvent, parentId: number, index: number) => void
	onChildDragEnter: (e: React.DragEvent, parentId: number, index: number) => void
	onChildDragLeave: (e: React.DragEvent) => void
	// Child drag state
	childDraggedIndex: { parentId: number; index: number } | null
	childHoveredIndex: { parentId: number; index: number } | null
}

/**
 * CategoryItem component for parent categories
 * Memoized to prevent unnecessary re-renders
 */
export const CategoryItem = React.memo<CategoryItemProps>(
	({
		category,
		index,
		level,
		isSelected,
		isExpanded,
		isDragEnabled,
		isDragged,
		isHovered,
		expandedCategories,
		onSelect,
		onToggleExpand,
		onDragStart,
		onDragEnd,
		onDragOver,
		onDrop,
		onDragEnter,
		onDragLeave,
		onChildDragStart,
		onChildDragEnd,
		onChildDragOver,
		onChildDrop,
		onChildDragEnter,
		onChildDragLeave,
		childDraggedIndex,
		childHoveredIndex,
	}) => {
		// Debug: Log render

		const hasChildren = category.children && category.children.length > 0

		// Use children order as provided by state
		const sortedChildren = React.useMemo(() => {
			if (!category.children || category.children.length === 0) return []
			return category.children
		}, [category.children])

		return (
			<div
				className={cn(
					"rounded-lg border transition-all duration-200 bg-card hover:shadow-md",
					isSelected && "bg-primary/5 border-primary/20 shadow-lg",
					isDragged && "opacity-50 scale-95",
					isHovered && "border-primary border-2 bg-primary/10 scale-[1.02]"
				)}
				onDragOver={(e) => {
					if (isDragEnabled && level === 0) {
						e.preventDefault()
						e.stopPropagation()
						e.dataTransfer.dropEffect = "move"
						onDragOver(e, index)
					}
				}}
				onDrop={(e) => {
					if (isDragEnabled && level === 0) {
						e.preventDefault()
						e.stopPropagation()
						onDrop(e, index)
					}
				}}
				onDragEnter={(e) => {
					if (isDragEnabled && level === 0) {
						e.preventDefault()
						e.stopPropagation()
						onDragEnter(e, index)
					}
				}}
				onDragLeave={(e) => {
					if (isDragEnabled && level === 0) {
						const rect = e.currentTarget.getBoundingClientRect()
						const x = e.clientX
						const y = e.clientY
						if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
							onDragLeave(e)
						}
					}
				}}
			>
				<div className="p-4">
					<div className="flex items-center gap-3 w-full">
						{isDragEnabled && level === 0 ? (
							<div
								draggable={true}
								onDragStart={(e) => onDragStart(index, e)}
								onDragEnd={onDragEnd}
								onMouseDown={(e) => {
									if (isDragEnabled) {
										e.stopPropagation()
									}
								}}
								className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
								style={{ userSelect: "none" }}
							>
								<GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors pointer-events-none" />
							</div>
						) : null}
						<div className="flex items-center gap-2 flex-1 text-right w-full">
							<CategoryIcon icon={category.icon} hasChildren={hasChildren} />
							<span
								className={cn(
									"font-medium cursor-pointer hover:text-primary transition-colors w-full",
									isSelected && "text-primary font-semibold"
								)}
								onClick={(e) => {
									e.stopPropagation()
									onSelect(category, e)
								}}
							>
								{category.name.ar || category.name.en}
							</span>
						</div>
						{hasChildren && (
							<div className="flex items-center gap-2">
								<span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
									{category.children.length}
								</span>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										onToggleExpand(category.id)
									}}
								>
									<ChevronRight
										className={cn("w-4 h-4 text-primary transition-transform", isExpanded ? "rotate-90" : "rotate-0")}
									/>
								</Button>
							</div>
						)}
					</div>
				</div>
				{hasChildren && isExpanded && (
					<div className="px-4 pb-4 border-t pt-3 space-y-2">
						{sortedChildren.map((child, idx) => {
							// Find original index in unsorted array for drag operations
							const originalIndex = category.children?.findIndex((c) => c.id === child.id) ?? idx
							const isChildDragged = childDraggedIndex?.parentId === category.id && childDraggedIndex?.index === originalIndex
							const isChildHovered =
								childHoveredIndex?.parentId === category.id &&
								childHoveredIndex?.index === originalIndex &&
								childDraggedIndex !== null &&
								childDraggedIndex.index !== originalIndex

							return (
								<CategoryChildItem
									key={child.id}
									category={child}
									parentId={category.id}
									index={originalIndex}
									level={level + 1}
									isSelected={false}
									isExpanded={expandedCategories.has(child.id)}
									isDragEnabled={isDragEnabled}
									isDragged={isChildDragged}
									isHovered={isChildHovered}
									expandedCategories={expandedCategories}
									onSelect={onSelect}
									onToggleExpand={(id) => onToggleExpand(id ?? child.id)}
									onDragStart={onChildDragStart}
									onDragEnd={onChildDragEnd}
									onDragOver={(e) => onChildDragOver(e, category.id, originalIndex)}
									onDrop={(e) => onChildDrop(e, category.id, originalIndex)}
									onDragEnter={(e) => onChildDragEnter(e, category.id, originalIndex)}
									onDragLeave={onChildDragLeave}
								/>
							)
						})}
					</div>
				)}
			</div>
		)
	}
)

CategoryItem.displayName = "CategoryItem"

