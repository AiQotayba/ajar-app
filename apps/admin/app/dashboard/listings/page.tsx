"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Eye, Sparkles, TrendingUp, Calendar, Clock, Building2, CheckCircle, XCircle, Heart } from "lucide-react"
import { TableCore, type TableColumn, type TableFilter } from "@/components/table/table-core"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { listingsApi } from "@/lib/api/listings"
import type { Listing } from "@/lib/types/listing"
import { ListingActionsDialog } from "@/components/listings/listing-actions-dialog"
import { DeleteListingDialog } from "@/components/listings/delete-listing-dialog"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { PageHeader } from "@/components/dashboard/page-header"

// Calculate availability status
function getAvailabilityStatus(availableFrom: string | null, availableUntil: string | null) {
  if (!availableFrom || !availableUntil) {
    return { status: 'unknown', label: 'غير محدد', variant: 'outline' as const }
  }

  const now = new Date()
  const from = new Date(availableFrom)
  const until = new Date(availableUntil)

  if (now < from) {
    return { status: 'upcoming', label: 'قريباً', variant: 'secondary' as const }
  }

  if (now > until) {
    return { status: 'expired', label: 'منتهي', variant: 'destructive' as const }
  }

  return { status: 'available', label: 'متاح', variant: 'default' as const }
}

export default function ListingsPage() {
  const queryClient = useQueryClient()
  const [stats, setStats] = React.useState({
    total: 0,
    approved: 0,
    inReview: 0,
    featured: 0,
  })

  const [actionDialog, setActionDialog] = React.useState<{
    listing: Listing | null
    action: "approve" | "reject" | null
    open: boolean
  }>({
    listing: null,
    action: null,
    open: false,
  })

  const [deleteDialog, setDeleteDialog] = React.useState<{
    listing: Listing | null
    open: boolean
  }>({
    listing: null,
    open: false,
  })

  // Fetch stats from API
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await listingsApi.getAll({
          page: 1,
          per_page: 1000, // Get all for stats
        })
        if (response.data) {
          const listings = response.data as unknown as Listing[]
          const meta = (response as any).meta
          setStats({
            total: meta?.total || listings.length,
            approved: listings.filter(l => l.status === 'approved').length,
            inReview: listings.filter(l => l.status === 'in_review').length,
            featured: listings.filter(l => l.is_featured).length,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: Listing["status"]; reason?: string }) =>
      listingsApi.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-data"] })
      toast.success("تم تحديث حالة الإعلان بنجاح")
      setActionDialog({ listing: null, action: null, open: false })
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث حالة الإعلان")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-data"] })
      toast.success("تم حذف الإعلان بنجاح")
      setDeleteDialog({ listing: null, open: false })
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف الإعلان")
    },
  })

  const handleStatusUpdate = (status: Listing["status"], reason?: string) => {
    if (actionDialog.listing) {
      updateStatusMutation.mutate({
        id: actionDialog.listing.id,
        status,
        reason,
      })
    }
  }

  const handleDelete = () => {
    if (deleteDialog.listing) {
      deleteMutation.mutate(deleteDialog.listing.id)
    }
  }

  const columns: TableColumn<Listing>[] = [
    {
      key: "title",
      label: "العنوان",
      sortable: true,
      render: (value, row) => (
        <div className="max-w-[300px] space-y-1">
          <p className="font-bold text-foreground truncate text-balance">{value?.ar}</p>
          <p className="font-bold text-foreground truncate text-balance">{value?.en}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {row.category?.name?.ar}
            </Badge>
            {row.is_featured && (
              <Badge className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                مميز
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "المالك",
      sortable: true,
      render: (value, row) =>
        row.owner ? (
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {row.owner.first_name} {row.owner.last_name}
            </p>
            <p className="text-xs text-muted-foreground font-mono">{row.owner.phone}</p>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">غير محدد</span>
        ),
    },
    {
      key: "governorate",
      label: "الموقع",
      sortable: true,
      render: (value, row) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{value?.name.ar || "غير محدد"}</p>
          {row.city && <p className="text-xs text-muted-foreground">{row.city.name.ar}</p>}
        </div>
      ),
    },
    {
      key: "price",
      label: "السعر",
      sortable: true,
      render: (value, row) => (
        <div className="space-y-0.5">
          <p className="font-bold text-primary text-lg">
            {value.toLocaleString("en")} {row.currency}
          </p>
          {row.type === "rent" && row.pay_every && (
            <p className="text-xs text-muted-foreground">كل {row.pay_every} يوم</p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      label: "النوع",
      sortable: true,
      render: (value) => {
        const typeConfig = {
          rent: { label: "إيجار", variant: "secondary" as const, icon: "🏠" },
          sale: { label: "بيع", variant: "default" as const, icon: "💰" },
        }
        const config = typeConfig[value as keyof typeof typeConfig]
        return (
          <Badge variant={config.variant} className="gap-1">
            <span>{config.icon}</span>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: "availability_status",
      label: "حالة التوفر",
      sortable: false,
      render: (_, row) => {
        const availability = getAvailabilityStatus(row.available_from, row.available_until)

        return (
          <div className="space-y-1">
            <Badge variant={availability.variant} className="gap-1">
              <Clock className="h-3 w-3" />
              {availability.label}
            </Badge>
            {row.available_from && (
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(row.available_from).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      label: "حالة الموافقة",
      sortable: true,
      render: (value: Listing["status"]) => {
        const statusConfig = {
          draft: {
            variant: "outline" as const,
            label: "مسودة",
            className: "border-gray-400 text-gray-700",
          },
          in_review: {
            variant: "secondary" as const,
            label: "قيد المراجعة",
            className: "bg-blue-100 text-blue-700 border-blue-300",
          },
          approved: {
            variant: "default" as const,
            label: "معتمد",
            className: "bg-green-100 text-green-700 border-green-300",
          },
          rejected: {
            variant: "destructive" as const,
            label: "مرفوض",
            className: "bg-red-100 text-red-700 border-red-300",
          },
        }

        const config = statusConfig[value] || statusConfig.draft

        return (
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: "views_count",
      label: "الإحصائيات",
      sortable: false,
      render: (value, row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium">{value.toLocaleString("ar-EG")}</span>
            <span className="text-muted-foreground">مشاهدة</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5 text-pink-500" />
            <span className="font-medium">{row.favorites_count.toLocaleString("ar-EG")}</span>
            <span className="text-muted-foreground">مفضلة</span>
          </div>
        </div>
      ),
    },
  ]

  const filters: TableFilter[] = [
    {
      key: "type",
      label: "نوع الإعلان",
      type: "select",
      options: [
        { label: "بيع", value: "sale" },
        { label: "إيجار", value: "rent" },
      ],
    },
    {
      key: "status",
      label: "الحالة",
      type: "select",
      options: [
        { label: "مسودة", value: "draft" },
        { label: "قيد المراجعة", value: "in_review" },
        { label: "معتمد", value: "approved" },
        { label: "مرفوض", value: "rejected" },
      ],
    },
    {
      key: "availability_status",
      label: "حالة التوفر",
      type: "select",
      options: [
        { label: "متاح", value: "available" },
        { label: "غير متاح", value: "unavailable" },
        { label: "مؤجر", value: "rented" },
        { label: "مباع", value: "solded" },
      ],
    },
    {
      key: "is_featured",
      label: "الإعلانات المميزة",
      type: "select",
      options: [
        { label: "مميز فقط", value: "1" },
        { label: "عادي فقط", value: "0" },
      ],
    },
    {
      key: "dateRange",
      label: "نطاق التاريخ",
      type: "dateRange",
    },
  ]

  const handleView = (listing: Listing) => {
    toast.info(`عرض الإعلان: ${listing.title}`, {
      description: `الرقم: ${listing.id} | المشاهدات: ${listing.views_count}`,
    })
  }

  const handleEdit = (listing: Listing) => {
    toast.success(`تعديل الإعلان: ${listing.title}`, {
      description: "سيتم فتح نافذة التعديل",
    })
  }

  const handleDeleteClick = (listing: Listing) => {
    setDeleteDialog({
      listing,
      open: true,
    })
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="إدارة الإعلانات"
        description="جدول شامل مع البحث والتصفية والترتيب والسحب والإفلات"
        icon={Building2}
        action={{
          label: "إضافة إعلان جديد",
          icon: Plus,
          onClick: () => toast.info("سيتم فتح نافذة إضافة إعلان"),
        }}
      />

      <TableCore<Listing>
        columns={columns}
        filters={filters}
        apiEndpoint="/admin/listings"
        enableDragDrop={true}
        enableActions={true}
        actions={{
          onView: handleView,
          onEdit: handleEdit, 
        }}
        enableView={true}
        enableEdit={true}
        enableDelete={true}
        enableDateRange={true}
        searchPlaceholder="ابحث في الإعلانات بالعنوان أو الوصف..."
        emptyMessage="لا توجد إعلانات. حاول تعديل الفلاتر أو إضافة إعلان جديد."
        skeletonRows={8}
        skeletonVariant="comfortable"
        enableSortOrder={false}
      />

      <ListingActionsDialog
        listing={actionDialog.listing}
        action={actionDialog.action}
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        onConfirm={handleStatusUpdate}
      />

    </div>
  )
}
