"use client"

import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/lib/api/categories"
import type { Category } from "@/lib/types/category"
import { TableColumn, TableCore, TableFilter } from "@/components/table/table-core"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/page-header"
import { FolderTree } from "lucide-react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export default function CategoriesPage() {
  // Fetch categories
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })


  // Flatten categories (parent + children) for table display
  const flattenedCategories =
    data?.data?.flatMap((parent) => [
      parent,
      ...parent.children.map((child) => ({ ...child, parent_name: parent.name.ar })),
    ]) || []

  // Define columns
  const columns: TableColumn<Category>[] = [
    {
      key: "id",
      label: "المعرف",
      sortable: true,
      // width: "80px",
      render: (_, row) => <span className="font-mono text-xs text-muted-foreground">#{row.id}</span>,
    },
    {
      key: "name",
      label: "اسم الفئة",
      sortable: true,
      // searchable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
            <FolderTree className="h-5 w-5 text-primary" />
          </div> */}
          <div>
            <div className="font-semibold text-foreground">{row.name?.ar}</div>
            <div className="text-xs text-muted-foreground">{row.name?.en}</div>
          </div>
        </div>
      ),
    },
    {
      key: "parent_name",
      label: "الفئة الأب",
      sortable: true,
      render: (_, row) => {
        if (row.parent_id === null) {
          return <Badge variant="outline">فئة رئيسية</Badge>
        }
        return <span className="text-sm text-muted-foreground">{(row as any).parent_name || "-"}</span>
      },
    },
    {
      key: "listings_count",
      label: "عدد الإعلانات",
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <span className="text-sm font-bold text-blue-600">{row.listings_count}</span>
          </div>
        </div>
      ),
    },
    {
      key: "properties",
      label: "الخصائص",
      render: (_, row) => (
        <Badge variant="secondary" className="font-mono">
          {row.properties.length} خاصية
        </Badge>
      ),
    },
    {
      key: "features",
      label: "المميزات",
      render: (_, row) => (
        <Badge variant="secondary" className="font-mono">
          {row.features.length} ميزة
        </Badge>
      ),
    },
    {
      key: "is_visible",
      label: "الحالة",
      sortable: true,
      render: (_, row) => (
        <Badge
          variant={row.is_visible ? "default" : "secondary"}
          className={row.is_visible ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-muted"}
        >
          {row.is_visible ? "ظاهرة" : "مخفية"}
        </Badge>
      ),
    },
  ]

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
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="إدارة الفئات"
          description="إدارة فئات الإعلانات وخصائصها ومميزاتها"
          icon={FolderTree}
          action={{
            label: "إضافة فئة جديدة",
            icon: Plus,
            onClick: () => toast.info("سيتم فتح نافذة إضافة فئة"),
          }}
        />

        {/* Table */}
        <TableCore<Category>
          apiEndpoint="/admin/categories"
          data={flattenedCategories}
          columns={columns}
          filters={filters}
          searchPlaceholder="ابحث عن فئة..."
          emptyMessage="لا توجد فئات"
          enableDateRange
          enableDelete={true}
          enableEdit={true}
          enableView={true}
          enableDragDrop={false}
          enableActions={true}
          actions={{
            onView: () => { },
            onEdit: () => { },
          }}
          skeletonRows={8}
          skeletonVariant="comfortable"
        />

      </div>
    </div>
  )
}
