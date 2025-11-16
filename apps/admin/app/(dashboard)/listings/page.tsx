"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Building2 } from "lucide-react"
import { TableCore } from "@/components/table/table-core"
import type { Listing } from "@/lib/types/listing"
import { ListingActionsDialog } from "@/components/listings/listing-actions-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { listingsColumns, listingsFilters } from "@/components/pages/listings"
import { api } from "@/lib/api"

export default function ListingsPage() {
  const { push } = useRouter()
  const queryClient = useQueryClient()
  const urlEndpoint = "/admin/listings"

  const [actionDialog, setActionDialog] = React.useState<{
    listing: Listing | null
    action: "approve" | "reject" | null
    open: boolean
  }>({
    listing: null,
    action: null,
    open: false,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: Listing["status"]; reason?: string }) =>
      api.put(`/admin/listings/${id}/status`, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
      setActionDialog({ listing: null, action: null, open: false })
    },
    onError: () => {
      console.error("حدث خطأ أثناء تحديث حالة الإعلان")
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

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="إدارة الإعلانات"
        description="جدول شامل مع البحث والتصفية والترتيب والسحب والإفلات"
        icon={Building2}
        actions={[
          {
            label: "إضافة إعلان جديد",
            icon: Plus,
            onClick: () => push("/listings/create"),
          }
        ]}
      />

      <TableCore<Listing>
        columns={listingsColumns}
        filters={listingsFilters}
        apiEndpoint={urlEndpoint}
        enableDragDrop={true}
        enableActions={true}
        actions={{
          onView: (listing: Listing) => push(`/listings/${listing.id}`),
          onEdit: (listing: Listing) => push(`/listings/${listing.id}/edit`),
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
