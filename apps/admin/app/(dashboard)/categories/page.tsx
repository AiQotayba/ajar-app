"use client"

import { Plus, FolderTree } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { TableCore, TableFilter } from "@/components/table/table-core"
import type { Category } from "@/lib/types/category"
import { PageHeader } from "@/components/dashboard/page-header"
import { getCategories } from "@/lib/api/categories"

import { CategoriesSidebar } from "@/components/pages/categories/sidebar"
import { CategoryDetailView } from "@/components/pages/categories/category-detail-view"
import { useState } from "react"
import { api } from "@/lib/api-client"
import { CategoryForm } from "@/components/pages/categories/form"
import { categoriesColumns } from "@/components/pages/categories/columns"

export default function CategoriesPage() {
	const [viewMode, setViewMode] = useState<"table" | "detail">("table")
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
	const [formOpen, setFormOpen] = useState(false)
	const [formMode, setFormMode] = useState<"create" | "update">("create")
	const [parentIdForNew, setParentIdForNew] = useState<number | null>(null)

	const UrlEndpoint = "/admin/categories"

	// Fetch categories
	const { data } = useQuery({
		queryKey: ["categories"],
		queryFn: getCategories,
	})

	const allCategories = (data?.data as unknown as Category[]) || []

	const flattenedCategories = allCategories.flatMap((parent: Category) => [
		parent,
		...parent.children.map((child: Category) => ({ ...child, parent_name: parent.name.ar })),
	])

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
			<div className="border-b p-6">
				<PageHeader
					title="إدارة الفئات"
					description="إدارة فئات الإعلانات وخصائصها ومميزاتها"
					icon={FolderTree}
					action={{ label: "إضافة فئة جديدة", icon: Plus, onClick: handleCreate }}
				/>
			</div>

			<div className="flex flex-1 overflow-hidden">
				<CategoriesSidebar
					categories={allCategories}
					selectedCategory={selectedCategory}
					onSelectCategory={handleSelectCategory}
					onBackToRoot={handleBackToTable}
					onReorder={async ({ id, newParentId, newIndex }: { id: number; newParentId: number | null; newIndex: number }) => {
						await api.put(`${UrlEndpoint}/${id}/reorder`, {
							id,
							newParentId,
							newIndex,
						})
					}}
				/>

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
								deleteDescription={(category) => `هل أنت متأكد من حذف الفئة "${category.name.ar}"؟`}
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
							onDelete={async (category) => {
								try {
									await api.delete(`${UrlEndpoint}/${category.id}`)
									setViewMode("table")
									setSelectedCategory(null)
								} catch (e) {
									console.error("Failed to delete category", e)
								}
							}}
							onSelectChild={(child) => {
								setSelectedCategory(child)
							}}
							onBackToTable={handleBackToTable}
							onPropertyAdd={() => { console.info("property add clicked") }}
							onPropertyEdit={() => { console.info("property edit clicked") }}
							onPropertyDelete={async () => { console.info("property delete clicked"); }}
							onFeatureAdd={() => { console.info("feature add clicked") }}
							onFeatureEdit={() => { console.info("feature edit clicked") }}
							onFeatureDelete={async () => { console.info("feature delete clicked"); }}
						/>
					) : null}
				</div>
			</div>

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