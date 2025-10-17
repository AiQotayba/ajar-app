"use client"

import * as React from "react"
import { Eye, Sparkles, TrendingUp, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { listingsApi } from "@/lib/api/listings"
import { toast } from "sonner"
import type { TableColumn, TableFilter } from "@/components/table/table-core"
import type { Listing } from "@/lib/types/listing"

// Status configuration
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

// Status Select Component
function StatusSelect({ listingId, currentStatus }: { listingId: number; currentStatus: Listing["status"] }) {
    const queryClient = useQueryClient()

    const updateStatusMutation = useMutation({
        mutationFn: async (newStatus: Listing["status"]) => {
            const response = await listingsApi.quickUpdateStatus(listingId, newStatus)
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            return response
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            toast.success("تم تحديث الحالة بنجاح")
        },
        onError: (error: any) => {
            toast.error(error?.message || "فشل تحديث الحالة")
        },
    })

    const config = statusConfig[currentStatus] || statusConfig.draft

    return (
        <Select
            value={currentStatus}
            onValueChange={(value) => updateStatusMutation.mutate(value as Listing["status"])}
            disabled={updateStatusMutation.isPending}
            dir="rtl"
        >
            <SelectTrigger className={`w-[140px] ${config.className}`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="draft" className="border-gray-400 text-gray-700">
                    مسودة
                </SelectItem>
                <SelectItem value="in_review" className="text-blue-700">
                    قيد المراجعة
                </SelectItem>
                <SelectItem value="approved" className="text-green-700">
                    معتمد
                </SelectItem>
                <SelectItem value="rejected" className="text-red-700">
                    مرفوض
                </SelectItem>
            </SelectContent>
        </Select>
    )
}

// Calculate availability status
export function getAvailabilityStatus(availableFrom: string | null, availableUntil: string | null) {
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

// Columns definition for listings table
export const listingsColumns: TableColumn<Listing>[] = [
    {
        key: "cover_image",
        label: "الصورة",
        sortable: false,
        render: (_, row) => {
            const imageUrl = row.cover_image || row.images?.[0]?.url || row.images?.[0]?.full_url
            return (
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={row.title?.ar || "صورة العقار"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            لا توجد صورة
                        </div>
                    )}
                </div>
            )
        },
    },
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
        render: (value: Listing["status"], row) => {
            return <StatusSelect listingId={row.id} currentStatus={value} />
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

// Filters definition
export const listingsFilters: TableFilter[] = [
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

