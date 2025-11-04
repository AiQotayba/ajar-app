"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Building2 } from "lucide-react"
import { TableCore } from "@/components/table/table-core"
import { listingsApi } from "@/lib/api/listings"
import type { Listing } from "@/lib/types/listing"
import { ListingActionsDialog } from "@/components/listings/listing-actions-dialog"
import { DeleteListingDialog } from "@/components/listings/delete-listing-dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { listingsColumns, listingsFilters, ListingForm, ListingView } from "@/components/pages/listings"

export default function ListingsPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [viewOpen, setViewOpen] = React.useState(false)
  const [selectedListing, setSelectedListing] = React.useState<Listing | null>(null)
  const [formMode, setFormMode] = React.useState<"create" | "update">("create")
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

  const [deleteDialog, setDeleteDialog] = React.useState<{
    listing: Listing | null
    open: boolean
  }>({
    listing: null,
    open: false,
  })


  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: Listing["status"]; reason?: string }) =>
      listingsApi.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
      setActionDialog({ listing: null, action: null, open: false })
    },
    onError: () => {
      console.error("حدث خطأ أثناء تحديث حالة الإعلان")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
      setDeleteDialog({ listing: null, open: false })
    },
    onError: () => {
      console.error("حدث خطأ أثناء حذف الإعلان")
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


  const handleView = (listing: Listing) => {
    setSelectedListing(listing)
    setViewOpen(true)
  }

  const handleEdit = (listing: Listing) => {
    setSelectedListing(listing)
    setFormMode("update")
    setFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedListing(null)
    setFormMode("create")
    setFormOpen(true)
  }

  const handleDeleteClick = (listing: Listing) => {
    setDeleteDialog({
      listing,
      open: true,
    })
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
            onClick: handleCreate,
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

      {/* Listing Form Dialog */}
      <ListingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        urlEndpoint={urlEndpoint}
        listing={selectedListing}
        mode={formMode}
      />

      {/* Listing View Dialog */}
      <ListingView
        open={viewOpen}
        onOpenChange={setViewOpen}
        urlEndpoint={urlEndpoint}
        listing={selectedListing}
      />
    </div>
  )
}
