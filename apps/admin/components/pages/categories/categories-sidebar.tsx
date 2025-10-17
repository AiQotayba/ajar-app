"use client"

import * as React from "react"
import { ChevronLeft, ChevronDown, FolderTree, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types/category"

interface CategoriesSidebarProps {
    categories: Category[]
    selectedCategory: Category | null
    onSelectCategory: (category: Category) => void
    onBackToRoot: () => void
}

export function CategoriesSidebar({
    categories,
    selectedCategory,
    onSelectCategory,
    onBackToRoot,
}: CategoriesSidebarProps) {
    const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set())

    // Check if we're viewing a child category
    const isChildView = selectedCategory?.parent_id !== null

    // Get parent categories
    const parentCategories = categories.filter((cat) => cat.parent_id === null)

    // Toggle expand/collapse
    const toggleExpand = (categoryId: number, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedIds((prev) => {
            const next = new Set(prev)
            if (next.has(categoryId)) {
                next.delete(categoryId)
            } else {
                next.add(categoryId)
            }
            return next
        })
    }

    // Auto-expand parent when child is selected
    React.useEffect(() => {
        if (selectedCategory?.parent_id) {
            setExpandedIds((prev) => new Set(prev).add(selectedCategory.parent_id!))
        }
    }, [selectedCategory])

    return (
        <div className="flex h-full w-80 flex-col border-l bg-card">
            {/* Header */}
            <div className="border-b p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <FolderTree className="h-5 w-5 text-primary" />
                        الفئات
                    </h3> 
                </div>
            </div>

            {/* Categories List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {parentCategories.map((category) => (
                        <CategoryItem
                            key={category.id}
                            category={category}
                            isSelected={selectedCategory?.id === category.id}
                            isExpanded={expandedIds.has(category.id)}
                            onSelect={onSelectCategory}
                            onToggleExpand={toggleExpand}
                            selectedCategory={selectedCategory}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

interface CategoryItemProps {
    category: Category
    isSelected: boolean
    isExpanded: boolean
    onSelect: (category: Category) => void
    onToggleExpand: (id: number, e: React.MouseEvent) => void
    selectedCategory: Category | null
}

function CategoryItem({
    category,
    isSelected,
    isExpanded,
    onSelect,
    onToggleExpand,
    selectedCategory,
}: CategoryItemProps) {
    const hasChildren = category.children && category.children.length > 0

    return (
        <div className="space-y-1">
            {/* Parent Item */}
            <button
                onClick={() => onSelect(category)}
                className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-primary/10",
                    isSelected && "bg-primary/20 font-semibold"
                )}
            >
                {/* Icon */}
                {category.icon && (
                    <div className="h-6 w-6 flex items-center justify-center rounded-md bg-primary/10 overflow-hidden shrink-0">
                        {category.icon.includes('/') || category.icon.includes('.') ? (
                            <img 
                                src={category.icon.startsWith('http') ? category.icon : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${category.icon}`}
                                alt={category.name.ar}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm">{category.icon}</span>
                        )}
                    </div>
                )}

                {/* Name */}
                <span className="flex-1 text-right truncate">{category.name.ar}</span>

                {/* Children Count Badge */}
                {hasChildren && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                        {category.children.length}
                    </Badge>
                )}

                {/* Expand/Collapse Button */}
                {hasChildren && (
                    <button
                        onClick={(e) => onToggleExpand(category.id, e)}
                        className="shrink-0 hover:bg-primary/20 rounded p-0.5 transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                )}
            </button>

            {/* Children Items */}
            {hasChildren && isExpanded && (
                <div className="mr-6 space-y-1 border-r-2 border-primary/20 pr-2">
                    {category.children.map((child) => (
                        <button
                            key={child.id}
                            onClick={() => onSelect(child)}
                            className={cn(
                                "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                                "hover:bg-primary/10",
                                selectedCategory?.id === child.id && "bg-primary/20 font-semibold"
                            )}
                        >
                            {child.icon && (
                                <div className="h-5 w-5 flex items-center justify-center rounded-sm bg-primary/5 overflow-hidden shrink-0">
                                    {child.icon.includes('/') || child.icon.includes('.') ? (
                                        <img 
                                            src={child.icon.startsWith('http') ? child.icon : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'}/storage/${child.icon}`}
                                            alt={child.name.ar}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs">{child.icon}</span>
                                    )}
                                </div>
                            )}
                            <span className="flex-1 text-right truncate text-xs">
                                {child.name.ar}
                            </span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                                {child.children.length}
                            </Badge>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

