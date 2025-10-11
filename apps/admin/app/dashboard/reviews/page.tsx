"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Star, MessageSquare, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import { TableCore, type TableColumn } from "@/components/table/table-core"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { reviewsApi } from "@/lib/api/reviews"
import type { Review } from "@/lib/types/review"
import { PageHeader } from "@/components/dashboard/page-header"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function ReviewsPage() {
    const queryClient = useQueryClient()

    // Fetch stats
    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await reviewsApi.getAll({ page: 1, per_page: 1000 })

                if (response.data) {
                    const reviews = response.data as unknown as Review[]

                    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
                    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0

                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            }
        }
        fetchStats()
    }, [])

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: (id: number) => reviewsApi.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data"] })
            toast.success("تم الموافقة على التقييم")
        },
        onError: () => {
            toast.error("فشل في الموافقة على التقييم")
        },
    })

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: (id: number) => reviewsApi.reject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data"] })
            toast.success("تم رفض التقييم")
        },
        onError: () => {
            toast.error("فشل في رفض التقييم")
        },
    })

    // Render star rating
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                            }`}
                    />
                ))}
            </div>
        )
    }

    // Columns definition
    const columns: TableColumn<Review>[] = [
        {
            key: "user",
            label: "المراجع",
            width: "min-w-[200px]",
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={value.avatar_url || undefined} alt={value.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                            {value.first_name?.charAt(0)}{value.last_name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-foreground">{value.full_name}</p>
                        <p className="text-xs text-muted-foreground">{value.phone}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "listing",
            label: "الإعلان",
            width: "min-w-[250px]",
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="relative h-14 w-20 rounded-lg overflow-hidden bg-muted">
                        {value.cover_image ? (
                            <img
                                src={value.cover_image}
                                alt={value.title.ar}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{value.title.ar}</p>
                        <p className="text-xs text-muted-foreground">#{value.id}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "rating",
            label: "التقييم",
            sortable: true,
            width: "w-36",
            render: (value, row) => (
                <div className="space-y-1">
                    {renderStars(value)}
                    <p className="text-xs text-muted-foreground font-medium">
                        {value} من 5
                    </p>
                </div>
            ),
        },
        {
            key: "is_approved",
            label: "الحالة",
            sortable: true,
            width: "w-32",
            render: (value, row) => (
                <div className="space-y-2">
                    <Badge
                        variant={value ? "default" : "secondary"}
                        className={value ? "bg-green-500" : "bg-amber-500"}
                    >
                        {value ? (
                            <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                موافق
                            </>
                        ) : (
                            <>
                                <XCircle className="h-3 w-3 mr-1" />
                                قيد المراجعة
                            </>
                        )}
                    </Badge>
                    {!value && (
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-600"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    approveMutation.mutate(row.id)
                                }}
                                disabled={approveMutation.isPending}
                            >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                موافقة
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    rejectMutation.mutate(row.id)
                                }}
                                disabled={rejectMutation.isPending}
                            >
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                رفض
                            </Button>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "created_at",
            label: "التاريخ",
            sortable: true,
            width: "w-40",
            render: (value) => (
                <div className="text-sm">
                    <p className="font-medium text-foreground">
                        {format(new Date(value), "dd MMM yyyy", { locale: ar })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(value), "hh:mm a", { locale: ar })}
                    </p>
                </div>
            ),
        },
    ]

    const handleView = (review: Review) => {
        toast.info(`عرض التقييم من: ${review.user.full_name}`, {
            description: `التقييم: ${review.rating} نجوم`,
        })
    }

    const handleEdit = (review: Review) => {
        toast.success(`تعديل تقييم: ${review.user.full_name}`, {
            description: "سيتم فتح نافذة التعديل",
        })
    }

    // Handle delete
    const handleDelete = async (review: Review) => {
        await reviewsApi.delete(review.id)
        queryClient.invalidateQueries({ queryKey: ["table-data"] })
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
                apiEndpoint="/admin/reviews"
                enableDragDrop={false}
                enableActions={true}
                enableSortOrder={false}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                }}
                enableView={true}
                enableEdit={true}
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
        </div>
    )
}

