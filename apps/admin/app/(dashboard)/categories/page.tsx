"use client"

import { useState } from "react"
import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, Plus } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/lib/types/category"
import { CategoriesSliderV2, CategoriesDetailSidebar, CategoryFormDrawer } from "@/components/pages/categoriesV2"
import { api } from "@/lib/api"

export default function CategoriesPage() {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    const { data: categories, isLoading, refetch } = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const response = await api.get('/admin/categories?sort_field=sort_order&sort_order=asc')

                // Ensure we always return an array
                return response.data.data
            } catch (error) {
                console.error("❌ [DEBUG] Error fetching categories:", error)
                return []
            }
        },
    })
    console.log("categories", categories)

    const handleSelectCategory = (category: Category | null) => {
        setSelectedCategory(category)
    }

    const handleReorder = React.useCallback(async () => {
        const result = await refetch()
        // Check both possible data structures
        const resultData = result.data as Category[] | { data: Category[] } | undefined
        return resultData as Category[] || []
    }, [refetch])

    // Categories Skeleton Component for Slider
    const CategoriesSkeleton = () => (
        <div className="w-full space-y-4" dir="rtl">
            {/* Drag Toggle Button Skeleton */}
            <div className="flex justify-end">
                <Skeleton className="h-9 w-48 rounded-md" />
            </div>
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 bg-card">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-4 w-24 rounded" />
                            </div>
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="flex flex-col">
            <PageHeader
                title="إدارة التصنيفات"
                description="نظم وحدّث تصنيفات العقارات الخاصة بك. يمكنك إضافة تصنيفات جديدة، تعديل الموجودة، أو حذفها حسب الحاجة"
                icon={FolderTree}
                actions={[
                    {
                        label: "إضافة تصنيف",
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: Plus,
                        variant: "default",
                    },
                ]}
                className="!p-6 mb-6"
            />

            <CategoryFormDrawer
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                category={null}
            />

            <div className=" grid grid-cols-1 lg:grid-cols-3 rounded-2xl bg-white shadow-md">
                {/* المحتوى الرئيسي - Slider */}
                <div className="col-span-1 overflow-auto bg-muted/30 p-6">
                    {isLoading ? <CategoriesSkeleton />
                        : <CategoriesSliderV2
                            categories={categories as Category[]}
                            onSelectCategory={handleSelectCategory}
                            selectedCategory={selectedCategory}
                            onReorder={handleReorder}
                        />
                    }
                </div>
                {/* Sidebar على اليمين */}
                <CategoriesDetailSidebar category={selectedCategory} />
            </div>
        </div>
    )
}
