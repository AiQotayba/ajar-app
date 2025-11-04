"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { FolderTree, Hash, Plus, Sparkles, Star } from "lucide-react"
import { TableCore, type TableColumn, type TableFilter } from "@/components/table/table-core"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { featuresApi } from "@/lib/api/features"
import type { Feature } from "@/lib/types/feature"
import { StatsGrid, type StatCard } from "@/components/dashboard/stats-grid"
import { PageHeader } from "@/components/dashboard/page-header"

export default function FeaturesPage() {
  const queryClient = useQueryClient()
  const [stats, setStats] = React.useState({
    total: 0,
    withIcon: 0,
    categories: 0,
    used: 0,
  })

  // Fetch data for stats (will be updated by TableCore via queryKey)
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await featuresApi.getAll()
        if (response.data) {
          const features = response.data as unknown as Feature[]
          setStats({
            total: features.length,
            withIcon: features.filter(f => f.icon).length,
            categories: new Set(features.map(f => f.category_id)).size,
            used: features.filter(f => (f.usage_count || 0) > 0).length,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  const columns: TableColumn<Feature>[] = [
    {
      key: "name",
      label: "اسم الميزة",
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1 max-w-[280px]">
          <div className="flex items-center gap-2">
            {row.icon && (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 flex items-center justify-center text-lg">
                {row.icon}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{value?.ar}</p>
              <p className="text-xs text-muted-foreground">{value?.en}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "الوصف",
      render: (value) => {
        if (!value?.ar && !value?.en) {
          return <span className="text-xs text-muted-foreground">-</span>
        }
        return (
          <div className="max-w-[200px] space-y-0.5">
            {value?.ar && (
              <p className="text-xs text-foreground line-clamp-2">{value.ar}</p>
            )}
            {value?.en && (
              <p className="text-[10px] text-muted-foreground line-clamp-1">{value.en}</p>
            )}
          </div>
        )
      },
    },
    {
      key: "category",
      label: "الفئة",
      sortable: true,
      render: (value) => {
        if (!value) {
          return <span className="text-xs text-muted-foreground">غير محدد</span>
        }
        return (
          <div className="space-y-1">
            <Badge variant="default" className="gap-1 bg-gradient-to-r from-primary to-primary/80">
              <Star className="h-3 w-3" />
              {value.name.ar}
            </Badge>
            <p className="text-[10px] text-muted-foreground">{value.listings_count} إعلان</p>
          </div>
        )
      },
    },
  ]

  const filters: TableFilter[] = [
    {
      key: "category_id",
      label: "الفئة",
      type: "select",
      options: [
        { label: "عقار", value: "365" },
        { label: "أثاث", value: "527" },
        // سيتم تحميلها ديناميكياً من API
      ],
    },
  ]

  const handleView = (feature: Feature) => {
    toast.info(`عرض الميزة: ${feature.name.ar}`, {
      description: `الرقم: ${feature.id} | الفئة: ${feature.category?.name.ar || 'غير محدد'}`,
    })
  }

  const handleEdit = (feature: Feature) => {
    toast.success(`تعديل الميزة: ${feature.name.ar}`, {
      description: "سيتم فتح نافذة التعديل",
    })
  }

  const handleDelete = async (feature: Feature) => {
    const response = await featuresApi.delete(feature.id)
    queryClient.invalidateQueries({ queryKey: ["table-data"] })
    
    // عرض رسالة من API
    if (response.message) {
      toast.success(response.message)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="إدارة المميزات"
        description="إدارة مميزات الإعلانات لكل فئة وتنظيمها"
        icon={Sparkles} 
        actions={[
          {
            label: "إضافة ميزة جديدة",
            icon: Plus,
            onClick: () => toast.info("سيتم فتح نافذة إضافة ميزة"),
          }
        ]}
      />

      {/* Table */}
      <TableCore<Feature>
        columns={columns}
        filters={filters}
        apiEndpoint="/admin/features"
        enableDragDrop={true}
        enableActions={true}
        actions={{
          onView: handleView,
          onEdit: handleEdit,
        }}
        enableView={true}
        enableEdit={true}
        enableDelete={true}
        enableDateRange={false}
        searchPlaceholder="ابحث في المميزات بالاسم..."
        emptyMessage="لا توجد مميزات. حاول إضافة ميزة جديدة."
        skeletonRows={8}
        skeletonVariant="default"
        deleteTitle="تأكيد حذف الميزة"
        deleteDescription={(feature) => `هل أنت متأكد من حذف الميزة "${feature.name.ar}"؟`}
        deleteWarning={(feature) =>
          feature.usage_count && feature.usage_count > 0
            ? `تحذير: هذه الميزة مستخدمة في ${feature.usage_count} إعلان`
            : null
        }
        onDeleteConfirm={handleDelete}
      />
    </div>
  )
}

