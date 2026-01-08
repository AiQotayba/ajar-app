"use client"

import * as React from "react"
import { Folder, FolderOpen, ChevronRight, GripVertical } from "lucide-react"
import type { Category } from "@/lib/types/category"
import { cn } from "@/lib/utils"
import Images from "@/components/ui/image"
import { Button } from "@/components/ui/button"
import { api, ApiResponse } from "@/lib/api-client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CategoryApiService } from "./services/category-api.service"

interface CategoriesSliderProps {
    categories: Category[]
    onSelectCategory: (category: Category | null) => void
    selectedCategory: Category | null
    onReorder?: () => void
}

const urlEndpoint = "/admin/categories"

export function CategoriesSlider({ categories, onSelectCategory, selectedCategory, onReorder }: CategoriesSliderProps) {
    const [isDragEnabled, setIsDragEnabled] = React.useState(false)
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
    const [localCategories, setLocalCategories] = React.useState<Category[]>(categories)
    const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set())
    const queryClient = useQueryClient()
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Drag and drop states for child categories
    const [draggedChildIndex, setDraggedChildIndex] = React.useState<{ parentId: number; index: number } | null>(null)
    const [hoveredChildIndex, setHoveredChildIndex] = React.useState<{ parentId: number; index: number } | null>(null)

    /**
     * Preserves scroll position when selecting a category
     */
    const handleSelectCategoryWithScrollPreservation = React.useCallback((category: Category, event?: React.MouseEvent) => {
        const scrollPositions: Array<{ element: HTMLElement; top: number; left: number }> = []

        const findAllScrollContainers = (element: HTMLElement | null): HTMLElement[] => {
            const containers: HTMLElement[] = []
            let current: HTMLElement | null = element

            while (current && current !== document.body && current !== document.documentElement) {
                const style = window.getComputedStyle(current)
                if (
                    style.overflow === "auto" ||
                    style.overflow === "scroll" ||
                    style.overflowY === "auto" ||
                    style.overflowY === "scroll" ||
                    style.overflowX === "auto" ||
                    style.overflowX === "scroll"
                ) {
                    containers.push(current)
                }
                current = current.parentElement
            }

            if (window.scrollY > 0 || window.scrollX > 0) {
                containers.push(document.documentElement)
            }

            return containers
        }

        const startElement = (event?.currentTarget as HTMLElement) || containerRef.current
        const scrollContainers = findAllScrollContainers(startElement)

        scrollContainers.forEach((container) => {
            scrollPositions.push({
                element: container,
                top: container.scrollTop,
                left: container.scrollLeft,
            })
        })

        const windowScroll = {
            top: window.scrollY || window.pageYOffset || 0,
            left: window.scrollX || window.pageXOffset || 0,
        }

        onSelectCategory(category)

        const restoreScroll = () => {
            scrollPositions.forEach(({ element, top, left }) => {
                try {
                    if (element && (element.scrollTop !== top || element.scrollLeft !== left)) {
                        element.scrollTop = top
                        element.scrollLeft = left
                    }
                } catch (e) {
                    console.error("Error restoring scroll position", e)
                }
            })

            const currentWindowTop = window.scrollY || window.pageYOffset || 0
            const currentWindowLeft = window.scrollX || window.pageXOffset || 0
            if (
                Math.abs(currentWindowTop - windowScroll.top) > 1 ||
                Math.abs(currentWindowLeft - windowScroll.left) > 1
            ) {
                window.scrollTo(windowScroll.left, windowScroll.top)
            }
        }

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

    // Parent category drag and drop handlers
    const handleDragStart = (index: number) => {
        if (!isDragEnabled) return
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        if (!isDragEnabled) return
        e.preventDefault()
        e.stopPropagation()
        if (draggedIndex !== null && draggedIndex !== index) {
            setHoveredIndex(index)
        }
    }

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        if (!isDragEnabled) return
        e.preventDefault()
        e.stopPropagation()

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            return
        }

        const items = Array.from(localCategories)
        const [reorderedItem] = items.splice(draggedIndex, 1)
        items.splice(dropIndex, 0, reorderedItem)

        // Get the target item (the one we dropped on) - BEFORE reordering
        const targetItem = localCategories[dropIndex]

        // Update local state immediately for better UX
        setLocalCategories(items)
        setDraggedIndex(null)
        setHoveredIndex(null)

        try {
            // Call API to update sort order on server
            // API expects: PUT /{urlEndpoint}/{id}/reorder with body: { sort_order: value }
            // We use targetItem.sort_order to place the reordered item at the target position
            const response = await api.put(`${urlEndpoint}/${reorderedItem.id}/reorder`, {
                sort_order: targetItem.sort_order,
            })

            if (response.isError) {
                throw new Error(response.message || "فشل في تحديث الترتيب")
            }

            toast.success("تم تحديث ترتيب التصنيف بنجاح")

            // Refetch data to ensure consistency with server
            if (onReorder) {
                await onReorder()
            } else {
                await queryClient.refetchQueries({ queryKey: ["categories"] })
            }
        } catch (error: any) {
            console.error("Error updating sort order:", error)

            // Show more specific error message
            const errorMessage = error?.response?.data?.message || error?.message || "فشل في تحديث الترتيب"
            toast.error(errorMessage)

            // Revert local changes on error by refetching
            if (onReorder) {
                await onReorder()
            } else {
                await queryClient.refetchQueries({ queryKey: ["categories"] })
            }
        }
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        setHoveredIndex(null)
        setDraggedChildIndex(null)
        setHoveredChildIndex(null)
    }

    // Child category drag and drop handlers
    const handleChildDragStart = (parentId: number, index: number) => {
        if (!isDragEnabled) return
        setDraggedChildIndex({ parentId, index })
    }

    const handleChildDrop = async (e: React.DragEvent, parentId: number, dropIndex: number) => {
        if (!isDragEnabled) return
        e.preventDefault()
        e.stopPropagation()

        if (
            draggedChildIndex === null ||
            draggedChildIndex.parentId !== parentId ||
            draggedChildIndex.index === dropIndex
        ) {
            setDraggedChildIndex(null)
            setHoveredChildIndex(null)
            return
        }

        const updateCategoryChildren = (cats: Category[]): Category[] => {
            return cats.map((cat) => {
                if (cat.id === parentId && cat.children) {
                    const children = Array.from(cat.children)
                    const [reorderedItem] = children.splice(draggedChildIndex!.index, 1)
                    children.splice(dropIndex, 0, reorderedItem)
                    return { ...cat, children }
                }
                if (cat.children && cat.children.length > 0) {
                    return { ...cat, children: updateCategoryChildren(cat.children) }
                }
                return cat
            })
        }

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

        // Get the target item (the one we dropped on) - BEFORE reordering
        const targetItem = parentCategory.children[dropIndex]
        const reorderedItem = parentCategory.children[draggedChildIndex.index]

        const updatedCategories = updateCategoryChildren(localCategories)
        // Update local state immediately for better UX
        setLocalCategories(updatedCategories)
        setDraggedChildIndex(null)
        setHoveredChildIndex(null)

        try {
            // Use CategoryApiService with index-based calculation
            const success = await CategoryApiService.reorderChildCategory(
                reorderedItem,
                targetItem,
                dropIndex, // Pass target index for calculation
                parentCategory,
                async () => {
                    // Refetch data to ensure consistency with server
                    if (onReorder) {
                        await onReorder()
                    } else {
                        await queryClient.refetchQueries({ queryKey: ["categories"] })
                    }
                },
                async () => {
                    // Revert local changes on error by refetching
                    if (onReorder) {
                        await onReorder()
                    } else {
                        await queryClient.refetchQueries({ queryKey: ["categories"] })
                    }
                }
            )

            if (!success) {
                // Error already handled in service
                if (onReorder) {
                    await onReorder()
                } else {
                    await queryClient.refetchQueries({ queryKey: ["categories"] })
                }
            }
        } catch (error: any) {
            console.error("Error updating child category sort order:", error)

            // Show more specific error message
            const errorMessage = error?.response?.data?.message || error?.message || "فشل في تحديث ترتيب الفئة الفرعية"
            toast.error(errorMessage)

            // Revert local changes on error by refetching
            if (onReorder) {
                await onReorder()
            } else {
                await queryClient.refetchQueries({ queryKey: ["categories"] })
            }
        }
    }

    const handleChildDragEnd = () => {
        setDraggedChildIndex(null)
        setHoveredChildIndex(null)
    }

    /**
     * Renders category icon with fallback
     */
    const renderCategoryIcon = (icon: string | null | undefined, hasChildren: boolean) => {
        if (icon) {
            const iconUrl = icon.startsWith("http")
                ? icon
                : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "https://ajar-backend.mystore.social"}/storage/${icon}`
            return (
                <Images
                    src={iconUrl}
                    alt=""
                    fill={false}
                    width={20}
                    height={20}
                    className="w-5 h-5 object-cover rounded flex-shrink-0"
                    onError={(e) => {
                        e.currentTarget.style.display = "none"
                    }}
                />
            )
        }
        return hasChildren ? (
            <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
        ) : (
            <Folder className="w-5 h-5 fill-primary text-primary flex-shrink-0" />
        )
    }

    /**
     * Renders a category item in slider format
     */
    const CategoryItem = ({
        category,
        level = 0,
        index,
        parentId: providedParentId,
    }: {
        category: Category
        level?: number
        index?: number
        parentId?: number
    }) => {
        const hasChildren = category.children && category.children.length > 0
        const isSelected = selectedCategory?.id === category.id
        const isExpanded = expandedCategories.has(category.id)

        // Child category rendering
        if (level > 0 && providedParentId !== undefined && index !== undefined) {
            const parentId = providedParentId
            const childIndex = index
            const canDrag = isDragEnabled && parentId > 0 && childIndex >= 0

            const toggleExpanded = () => {
                setExpandedCategories((prev) => {
                    const newSet = new Set(prev)
                    if (newSet.has(category.id)) {
                        newSet.delete(category.id)
                    } else {
                        newSet.add(category.id)
                    }
                    return newSet
                })
            }

            const isDragged = canDrag && draggedChildIndex?.parentId === parentId && draggedChildIndex?.index === childIndex
            const isHovered =
                canDrag &&
                hoveredChildIndex?.parentId === parentId &&
                hoveredChildIndex?.index === childIndex &&
                draggedChildIndex !== null &&
                draggedChildIndex.index !== childIndex

            const handleDragOver = (e: React.DragEvent) => {
                if (level > 0) {
                    e.preventDefault()
                    e.stopPropagation()
                    if (isDragEnabled) {
                        e.dataTransfer.dropEffect = "move"
                        if (draggedChildIndex !== null && draggedChildIndex.parentId === parentId && draggedChildIndex.index !== childIndex) {
                            setHoveredChildIndex({ parentId, index: childIndex })
                        }
                    } else {
                        e.dataTransfer.dropEffect = "none"
                    }
                }
            }

            const handleDrop = (e: React.DragEvent) => {
                if (canDrag) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleChildDrop(e, parentId, childIndex)
                }
            }

            const handleDragEnter = (e: React.DragEvent) => {
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
                        "rounded-lg mb-2 transition-all duration-200 border",
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
                            "flex flex-row items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            isSelected && "bg-primary/5"
                        )}
                    >
                        <div className="flex items-center gap-2 flex-1 text-right w-full">
                            {canDrag ? (
                                <div
                                    draggable={true}
                                    onDragStart={(e) => {
                                        e.stopPropagation()
                                        e.dataTransfer.effectAllowed = "move"
                                        e.dataTransfer.setData("text/plain", childIndex.toString())
                                        e.dataTransfer.setData("application/json", JSON.stringify({ index: childIndex, parentId, categoryId: category.id }))
                                        handleChildDragStart(parentId, childIndex)
                                    }}
                                    onDragEnd={(e) => {
                                        e.stopPropagation()
                                        handleChildDragEnd()
                                    }}
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
                                        toggleExpanded()
                                    }
                                }}
                                disabled={!hasChildren}
                            >
                                {renderCategoryIcon(category.icon, hasChildren)}
                            </Button>
                            <span
                                className={cn(
                                    "font-medium cursor-pointer hover:text-primary transition-colors flex-1 text-right w-full",
                                    isSelected && "text-primary font-semibold"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleSelectCategoryWithScrollPreservation(category, e)
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
                                        toggleExpanded()
                                    }
                                }}
                                disabled={!hasChildren}
                                className="hover:bg-transparent cursor-pointer p-0"
                            >
                                <ChevronRight
                                    className={cn("w-5 h-5 text-primary flex-shrink-0 transition-transform", isExpanded ? "rotate-90" : "rotate-0")}
                                />
                            </Button>
                        )}
                    </div>
                    {hasChildren && isExpanded && (
                        <div className="px-4 pb-3 space-y-2 border-t pt-2 mt-2">
                            {category.children.map((child, idx) => (
                                <CategoryItem key={child.id} category={child} level={level + 1} index={idx} parentId={category.id} />
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        // Parent category rendering (slider card style)
        const isDragged = draggedIndex !== null && draggedIndex === index
        const isHovered = hoveredIndex === index && draggedIndex !== null && draggedIndex !== index

        return (
            <div
                className={cn(
                    "rounded-lg border transition-all duration-200 bg-card hover:shadow-md",
                    isSelected && "bg-primary/5 border-primary/20 shadow-lg",
                    isDragged && "opacity-50 scale-95",
                    isHovered && "border-primary border-2 bg-primary/10 scale-[1.02]"
                )}
                onDragOver={(e) => {
                    if (isDragEnabled && level === 0 && index !== undefined) {
                        e.preventDefault()
                        e.stopPropagation()
                        e.dataTransfer.dropEffect = "move"
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
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX
                        const y = e.clientY
                        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                            setHoveredIndex(null)
                        }
                    }
                }}
            >
                <div className="p-4">
                    <div className="flex items-center gap-3 w-full">
                        {isDragEnabled && level === 0 ? (
                            <div
                                draggable={true}
                                onDragStart={(e) => {
                                    e.stopPropagation()
                                    if (index !== undefined) {
                                        e.dataTransfer.effectAllowed = "move"
                                        e.dataTransfer.setData("text/plain", index.toString())
                                        e.dataTransfer.setData("application/json", JSON.stringify({ index, categoryId: category.id }))
                                        handleDragStart(index)
                                    }
                                }}
                                onDragEnd={(e) => {
                                    e.stopPropagation()
                                    handleDragEnd()
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
                        <div className="flex items-center gap-2 flex-1 text-right w-full">
                            {renderCategoryIcon(category.icon, hasChildren)}
                            <span
                                className={cn(
                                    "font-medium cursor-pointer hover:text-primary transition-colors w-full",
                                    isSelected && "text-primary font-semibold"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleSelectCategoryWithScrollPreservation(category, e)
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
                                        setExpandedCategories((prev) => {
                                            const newSet = new Set(prev)
                                            if (newSet.has(category.id)) {
                                                newSet.delete(category.id)
                                            } else {
                                                newSet.add(category.id)
                                            }
                                            return newSet
                                        })
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
                        {category.children.sort((a, b) => a.sort_order - b.sort_order).map((child, idx) => (
                            <CategoryItem key={child.id} category={child} level={level + 1} index={idx} parentId={category.id} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div ref={containerRef} className="w-full" dir="rtl">
            {/* Drag & Drop Toggle Button */}
            <div className="flex justify-end mb-4">
                <Button
                    variant={isDragEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                        const newState = !isDragEnabled
                        setIsDragEnabled(newState)
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

            {/* Slider Container */}
            <ScrollArea className="w-full h-[calc(100vh-200px)]" dir="rtl">
                <div className="grid grid-cols-1 gap-4 pr-4">
                    {localCategories.map((category, index) => (
                        <CategoryItem key={category.id} category={category} index={index} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}

