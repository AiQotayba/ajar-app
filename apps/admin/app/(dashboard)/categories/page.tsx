"use client"

import * as React from "react"
import { Plus, FolderTree } from "lucide-react"
import { TableCore, TableFilter } from "@/components/table/table-core"
import type { Category } from "@/lib/types/category"
import { PageHeader } from "@/components/dashboard/page-header"
import {
    categoriesColumns,
    CategoryForm,
    CategoriesSidebar,
    CategoryDetailView,
} from "@/components/pages/categories"
import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/lib/api/categories"

export default function CategoriesPage() {
    const [viewMode, setViewMode] = React.useState<"table" | "detail">("table")
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)
    const [formOpen, setFormOpen] = React.useState(false)
    const [formMode, setFormMode] = React.useState<"create" | "update">("create")
    const [parentIdForNew, setParentIdForNew] = React.useState<number | null>(null)
    const UrlEndpoint = "/admin/categories"

    // Fetch categories
    const { data } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    })

    // Get all categories
    const allCategories = (data?.data as unknown as Category[]) || []
    
    // Flatten for table display
    const flattenedCategories = allCategories.flatMap((parent: Category) => [
        parent,
        ...parent.children.map((child: Category) => ({ ...child, parent_name: parent.name.ar })),
    ])

    // Handlers
    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category)
        setViewMode("detail")
    }

    const handleBackToTable = () => {
        setViewMode("table")
        setSelectedCategory(null)
    }

    const handleEdit = (category: Category) => {
        setSelectedCategory(category)
        setFormMode("update")
        setParentIdForNew(null)
        setFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedCategory(null)
        setFormMode("create")
        setParentIdForNew(null)
        setFormOpen(true)
    }

    const handleAddSubCategory = (parentCategory: Category) => {
        setSelectedCategory(null)
        setFormMode("create")
        setParentIdForNew(parentCategory.id)
        setFormOpen(true)
    }

    const handleDelete = (category: Category) => {
        // Will use the table's built-in delete dialog
        console.log("Delete category:", category.id)
    }

    const handleSelectChild = (child: Category) => {
        setSelectedCategory(child)
        // View mode stays as 'detail'
    }

    // Property handlers
    const handlePropertyAdd = () => {
        console.log("Add property for category:", selectedCategory?.id)
        // TODO: Open property form dialog
    }

    const handlePropertyEdit = (property: any) => {
        console.log("Edit property:", property.id)
        // TODO: Open property form dialog with property data
    }

    const handlePropertyDelete = async (propertyId: number) => {
        console.log("Delete property:", propertyId)
        // TODO: Call API to delete property and refetch category
    }

    // Feature handlers
    const handleFeatureAdd = () => {
        console.log("Add feature for category:", selectedCategory?.id)
        // TODO: Open feature form dialog
    }

    const handleFeatureEdit = (feature: any) => {
        console.log("Edit feature:", feature.id)
        // TODO: Open feature form dialog with feature data
    }

    const handleFeatureDelete = async (featureId: number) => {
        console.log("Delete feature:", featureId)
        // TODO: Call API to delete feature and refetch category
    }

    // Define filters
    const filters: TableFilter[] = [
        {
            key: "is_visible",
            label: "حالة الظهور",
            type: "select",
            options: [
                { label: "الكل", value: "all" },
                { label: "ظاهرة", value: "true" },
                { label: "مخفية", value: "false" },
            ],
        },
        {
            key: "parent_id",
            label: "نوع الفئة",
            type: "select",
            options: [
                { label: "الكل", value: "all" },
                { label: "فئات رئيسية", value: "null" },
                { label: "فئات فرعية", value: "not_null" },
            ],
        },
    ]

    return (
        <div className="flex h-screen flex-col">
            {/* Header */}
            <div className="border-b p-6">
                <PageHeader
                    title="إدارة الفئات"
                    description="إدارة فئات الإعلانات وخصائصها ومميزاتها"
                    icon={FolderTree}
                    action={{
                        label: "إضافة فئة جديدة",
                        icon: Plus,
                        onClick: handleCreate,
                    }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Always visible */}
                <CategoriesSidebar
                    categories={allCategories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                    onBackToRoot={handleBackToTable}
                />

                {/* Main View Area */}
                <div className="flex-1 overflow-auto bg-muted/30">
                    {viewMode === "table" ? (
                        <div className="p-6">
                            <TableCore<Category>
                                columns={categoriesColumns}
                                apiEndpoint={UrlEndpoint}
                                data={flattenedCategories}
                                filters={filters}
                                enableDragDrop={true}
                                enableActions={true}
                                enableSortOrder={true}
                                actions={{
                                    onView: handleSelectCategory,
                                    onEdit: handleEdit,
                                }}
                                enableView={true}
                                enableEdit={true}
                                enableDelete={true}
                                enableDateRange={true}
                                searchPlaceholder="ابحث في الفئات..."
                                emptyMessage="لا توجد فئات."
                                skeletonRows={8}
                                skeletonVariant="comfortable"
                                deleteTitle="تأكيد حذف الفئة"
                                deleteDescription={(category) =>
                                    `هل أنت متأكد من حذف الفئة "${category.name.ar}"؟`
                                }
                                deleteWarning={(category) =>
                                    category.listings_count && category.listings_count > 0
                                        ? `تحذير: هذه الفئة تحتوي على ${category.listings_count} إعلان`
                                        : null
                                }
                            />
                        </div>
                    ) : selectedCategory ? (
                        <CategoryDetailView
                            category={selectedCategory}
                            onEdit={handleEdit}
                            onAddSubCategory={handleAddSubCategory}
                            onDelete={handleDelete}
                            onSelectChild={handleSelectChild}
                            onBackToTable={handleBackToTable}
                            onPropertyAdd={handlePropertyAdd}
                            onPropertyEdit={handlePropertyEdit}
                            onPropertyDelete={handlePropertyDelete}
                            onFeatureAdd={handleFeatureAdd}
                            onFeatureEdit={handleFeatureEdit}
                            onFeatureDelete={handleFeatureDelete}
                        />
                    ) : null}
                </div>
            </div>

            {/* Category Form Dialog */}
            <CategoryForm
                open={formOpen}
                onOpenChange={setFormOpen}
                urlEndpoint={UrlEndpoint}
                category={selectedCategory}
                mode={formMode}
                defaultParentId={parentIdForNew}
            />
        </div>
    )
}
