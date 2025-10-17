"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Star } from "lucide-react"
import { TableCore } from "@/components/table/table-core"
import { reviewsApi } from "@/lib/api/reviews"
import type { Review } from "@/lib/types/review"
import { PageHeader } from "@/components/dashboard/page-header"
import { getReviewsColumns, ReviewForm, ReviewView } from "@/components/pages/reviews"

export default function ReviewsPage() {
    const queryClient = useQueryClient()
    const [formOpen, setFormOpen] = React.useState(false)
    const [viewOpen, setViewOpen] = React.useState(false)
    const [selectedReview, setSelectedReview] = React.useState<Review | null>(null)
    const urlEndpoint = "/admin/reviews"

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, isApproved }: { id: number; isApproved: boolean }) => {
            return isApproved ? reviewsApi.approve(id) : reviewsApi.reject(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
        },
        onError: () => {
            console.error("فشل في تحديث حالة التقييم")
        },
    })

    // Get columns with mutation
    const columns = getReviewsColumns(updateMutation)

    const handleView = (review: Review) => {
        setSelectedReview(review)
        setViewOpen(true)
    }

    const handleEdit = (review: Review) => {
        setSelectedReview(review)
        setFormOpen(true)
    }

    // Handle delete
    const handleDelete = async (review: Review) => {
        await reviewsApi.delete(review.id)
        queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="إدارة التقييمات"
                description="إدارة تقييمات المستخدمين للإعلانات"
                icon={Star} 
            />

            <TableCore<Review>
                columns={columns}
                apiEndpoint={urlEndpoint}
                enableDragDrop={false}
                enableActions={true}
                enableSortOrder={false}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                }}
                enableView={true}
                enableEdit={false}
                enableDelete={true}
                enableDateRange={true}
                searchPlaceholder="ابحث في التقييمات..."
                emptyMessage="لا توجد تقييمات."
                skeletonRows={8}
                skeletonVariant="comfortable"
                // Delete dialog props
                deleteTitle="تأكيد حذف التقييم"
                deleteDescription={(review) =>
                    `هل أنت متأكد من حذف تقييم "${review.user.full_name}" للإعلان "${review.listing.title.ar}"؟`
                }
                deleteWarning={(review) =>
                    review.is_approved
                        ? "تحذير: هذا التقييم موافق عليه ومنشور للمستخدمين"
                        : null
                }
                onDeleteConfirm={handleDelete}
            />

            {/* Review Form Dialog */}
            {/* <ReviewForm
                open={formOpen}
                onOpenChange={setFormOpen}
                urlEndpoint={urlEndpoint}
                review={selectedReview}
            /> */}

            {/* Review View Dialog */}
            <ReviewView
                open={viewOpen}
                onOpenChange={setViewOpen}
                urlEndpoint={urlEndpoint}
                review={selectedReview}
            />
        </div>
    )
}

