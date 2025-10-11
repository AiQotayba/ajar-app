"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Image as ImageIcon, Eye, EyeOff, MousePointer2, Calendar } from "lucide-react"
import { TableCore, type TableColumn } from "@/components/table/table-core"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { slidersApi } from "@/lib/api/sliders"
import type { Slider } from "@/lib/types/slider"
import { PageHeader } from "@/components/dashboard/page-header"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function SlidersPage() {
    const queryClient = useQueryClient()

    // Check if slider is active based on dates
    const getSliderStatus = (slider: Slider) => {
        const now = new Date()
        const startDate = new Date(slider.start_at)
        const endDate = new Date(slider.end_at)

        if (!slider.active) return "inactive"
        if (now < startDate) return "scheduled"
        if (now > endDate) return "expired"
        return "active"
    }

    // Columns definition
    const columns: TableColumn<Slider>[] = [
        {
            key: "image_url",
            label: "الصورة",
            width: "w-32",
            render: (value, row) => (
                <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-muted group">
                    {value ? (
                        <img
                            src={value}
                            alt={row.title.ar}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "title",
            label: "العنوان",
            sortable: true,
            width: "min-w-[250px]",
            render: (value, row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{value?.ar}</p>
                    </div> 
                    <p className="text-xs text-muted-foreground/70">{value?.en}</p>
                </div>
            ),
        },
        {
            key: "start_at",
            label: "فترة العرض",
            sortable: true,
            width: "min-w-[200px]",
            render: (value, row) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="text-muted-foreground">من:</span>
                        <span className="font-medium">
                            {format(new Date(value), "dd MMM yyyy", { locale: ar })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3 text-red-600" />
                        <span className="text-muted-foreground">إلى:</span>
                        <span className="font-medium">
                            {format(new Date(row.end_at), "dd MMM yyyy", { locale: ar })}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "active",
            label: "الحالة",
            sortable: true,
            width: "w-32",
            render: (value, row) => {
                const status = getSliderStatus(row)
                const statusConfig = {
                    active: {
                        label: "نشط",
                        icon: Eye,
                        className: "bg-green-500",
                    },
                    inactive: {
                        label: "معطل",
                        icon: EyeOff,
                        className: "bg-gray-500",
                    },
                    scheduled: {
                        label: "مجدول",
                        icon: Calendar,
                        className: "bg-blue-500",
                    },
                    expired: {
                        label: "منتهي",
                        icon: Calendar,
                        className: "bg-red-500",
                    },
                }

                const config = statusConfig[status]
                const Icon = config.icon

                return (
                    <Badge variant={status === "active" ? "default" : "secondary"} className={config.className}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                    </Badge>
                )
            },
        },
        {
            key: "clicks",
            label: "النقرات",
            sortable: true,
            width: "w-24",
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-14 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-600">{value || 0}</span>
                    </div>
                    <MousePointer2 className="h-3 w-3 text-muted-foreground" />
                </div>
            ),
        },
    ]

    const handleView = (slider: Slider) => {
        toast.info(`عرض السلايد: ${slider.title.ar}`, {
            description: `الرابط: ${slider.target_url}`,
        })
    }

    const handleEdit = (slider: Slider) => {
        toast.success(`تعديل السلايد: ${slider.title.ar}`, {
            description: "سيتم فتح نافذة التعديل",
        })
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="إدارة السلايدر"
                description="إدارة شرائح العرض الرئيسية في الصفحة الرئيسية"
                icon={ImageIcon} 
                action={{
                    label: "إضافة سلايد جديد",
                    icon: Plus,
                    onClick: () => toast.info("سيتم فتح نافذة إضافة سلايد"),
                }}
            />

            <TableCore<Slider>
                columns={columns}
                apiEndpoint="/admin/sliders"
                enableDragDrop={true}
                enableActions={true}
                enableSortOrder={true}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                }}
                enableView={true}
                enableEdit={true}
                enableDelete={true}
                enableDateRange={true}
                searchPlaceholder="ابحث في السلايدات..."
                emptyMessage="لا توجد سلايدات."
                skeletonRows={5}
                skeletonVariant="comfortable"
                // Delete dialog props
                deleteTitle="تأكيد حذف السلايد"
                deleteDescription={(slider) => `هل أنت متأكد من حذف السلايد "${slider.title.ar}"؟`}
                deleteWarning={(slider) =>
                    slider.clicks && slider.clicks > 0
                        ? `تحذير: هذا السلايد حصل على ${slider.clicks} نقرة`
                        : null
                }
            />
        </div>
    )
}

