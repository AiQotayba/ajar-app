"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree, Plus } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import type { Category } from "@/lib/types/category"
import { CategoriesAccordion, CategoriesDetailSidebar, CategoryFormDrawer } from "@/components/pages/categoriesV2"
import { api } from "@/lib/api"

export default function CategoriesPage() {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    const { data: categories, isLoading, refetch } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await api.get<{ data: Category[] }>('/admin/categories')
            return response.data
        },
    })

    const handleSelectCategory = (category: Category | null) => {
        setSelectedCategory(category)
    }

    // Categories Skeleton Component
    const CategoriesSkeleton = () => (
        <div className="max-w-4xl mx-auto space-y-3" dir="rtl">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                    {/* Accordion Header Skeleton */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-5 w-5 rounded" />
                        </div>
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    {/* Accordion Content Skeleton (for some items) */}
                </div>
            ))}
        </div>
    )

    return (
        <div className="flex h-full flex-col">
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

            <div className=" overflow-hidden grid grid-cols-1 lg:grid-cols-3 h-full rounded-2xl bg-white shadow-md">
                {/* Sidebar على اليسار */}
                {/* المحتوى الرئيسي - Accordion */}
                <div className="col-span-1 overflow-auto bg-muted/30 p-6">
                    {isLoading
                        ? <CategoriesSkeleton />
                        : <CategoriesAccordion 
                            categories={categories?.data as any || []} 
                            onSelectCategory={handleSelectCategory} 
                            selectedCategory={selectedCategory}
                            onReorder={refetch}
                        />
                    }
                </div>
                <CategoriesDetailSidebar
                    category={selectedCategory}
                />

            </div>
        </div>
    )
}
