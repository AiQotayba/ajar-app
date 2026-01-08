import * as React from "react"
import { ChevronRight, GripVertical } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "./category-icon"

interface CategoryChildItemProps {
	category: Category
	parentId: number
	index: number
	level: number
	isSelected: boolean
	isExpanded: boolean
	isDragEnabled: boolean
	isDragged: boolean
	isHovered: boolean
	expandedCategories?: Set<number>
	onSelect: (category: Category, event?: React.MouseEvent) => void
	onToggleExpand: (id?: number) => void
	onDragStart: (parentId: number, index: number, e: React.DragEvent) => void
	onDragEnd: () => void
	onDragOver: (e: React.DragEvent) => void
	onDrop: (e: React.DragEvent) => void
	onDragEnter: (e: React.DragEvent) => void
	onDragLeave: (e: React.DragEvent) => void
}

/**
 * CategoryChildItem component for nested categories
 * Memoized to prevent unnecessary re-renders
 */
export const CategoryChildItem = React.memo<CategoryChildItemProps>(
	({
		category,
		parentId,
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
	}) => {
		const hasChildren = category.children && category.children.length > 0
		// Use expandedCategories if provided, otherwise use isExpanded prop
		const isChildExpanded = expandedCategories ? expandedCategories.has(category.id) : isExpanded

		return (
			<div
				className={cn(
					"rounded-lg mb-2 transition-all duration-200 border",
					isSelected && "bg-primary/5 border-primary/20",
					isDragged && "opacity-50 scale-95",
					isHovered && "border-primary border-2 bg-primary/10 scale-[1.02]"
				)}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
			>
				<div
					className={cn(
						"flex flex-row items-center gap-3 px-4 py-3 rounded-lg transition-colors",
						isSelected && "bg-primary/5"
					)}
				>
					<div className="flex items-center gap-2 flex-1 text-right w-full">
						{isDragEnabled ? (
							<div
								draggable={true}
								onDragStart={(e) => onDragStart(parentId, index, e)}
								onDragEnd={onDragEnd}
								onDragOver={(e) => {
									e.preventDefault()
									e.stopPropagation()
									e.dataTransfer.dropEffect = "move"
								}}
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
						<Button
							variant="ghost"
							size="icon"
							className="hover:bg-transparent cursor-pointer p-0"
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								if (hasChildren) {
									onToggleExpand(category.id)
								}
							}}
							disabled={!hasChildren}
						>
							<CategoryIcon icon={category.icon} hasChildren={hasChildren} />
						</Button>
						<span
							className={cn(
								"font-medium cursor-pointer hover:text-primary transition-colors flex-1 text-right w-full",
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
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								if (hasChildren) {
									onToggleExpand(category.id)
								}
							}}
							disabled={!hasChildren}
							className="hover:bg-transparent cursor-pointer p-0"
						>
							<ChevronRight
								className={cn("w-5 h-5 text-primary flex-shrink-0 transition-transform", isChildExpanded ? "rotate-90" : "rotate-0")}
							/>
						</Button>
					)}
				</div>
				{hasChildren && isChildExpanded && (
					<div className="px-4 pb-3 space-y-2 border-t pt-2 mt-2">
						{category.children.map((child, idx) => (
							<CategoryChildItem
								key={child.id}
								category={child}
								parentId={category.id}
								index={idx}
								level={level + 1}
								isSelected={false}
								isExpanded={false}
								isDragEnabled={isDragEnabled}
								isDragged={false}
								isHovered={false}
								expandedCategories={expandedCategories}
								onSelect={onSelect}
								onToggleExpand={onToggleExpand}
								onDragStart={onDragStart}
								onDragEnd={onDragEnd}
								onDragOver={onDragOver}
								onDrop={onDrop}
								onDragEnter={onDragEnter}
								onDragLeave={onDragLeave}
							/>
						))}
					</div>
				)}
			</div>
		)
	}
)

CategoryChildItem.displayName = "CategoryChildItem"

