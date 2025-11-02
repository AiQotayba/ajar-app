"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FolderTree } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { getCategories } from "@/lib/api/categories"
import type { Category } from "@/lib/types/category"
import { TestAccordion, TestDetailSidebar } from "@/components/pages/test"

export default function TestPage() {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    })

    const categories = (data?.data as unknown as Category[]) || []

    const handleSelectCategory = (category: Category | null) => {
        setSelectedCategory(category)
        console.info("✅ Selected category:", category?.name.ar || category?.name.en)
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col">
            <div className="border-b p-6">
                <PageHeader
                    title="اختبار Accordion متداخل"
                    description="عرض التصنيفات باستخدام Accordion متداخل"
                    icon={FolderTree}
                />
            </div>

            <div className=" overflow-hidden grid grid-cols-1 lg:grid-cols-3">
                {/* Sidebar على اليسار */}
                {/* المحتوى الرئيسي - Accordion */}
                <div className="col-span-1 overflow-auto bg-muted/30 p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-muted-foreground">جاري التحميل...</div>
                        </div>
                    ) : (
                        <TestAccordion categories={categories} onSelectCategory={handleSelectCategory} selectedCategory={selectedCategory} />
                    )}
                </div>
                <TestDetailSidebar 
                    category={selectedCategory} 
                    onEdit={(category) => {
                        console.info("✅ Edit category:", category.name.ar)
                        // TODO: Open edit dialog or navigate to edit page
                    }}
                    onDelete={async (category) => {
                        console.info("✅ Delete category:", category.name.ar)
                        // TODO: API call to delete
                        setSelectedCategory(null)
                    }}
                />

            </div>
        </div>
    )
}
