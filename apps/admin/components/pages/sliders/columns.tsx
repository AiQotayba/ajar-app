"use client"

import * as React from "react"
import { Eye, EyeOff, MousePointer2, Calendar, Image as ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import type { TableColumn } from "@/components/table/table-core"
import type { Slider } from "@/lib/types/slider"

// Helper function to check slider status
export const getSliderStatus = (slider: Slider) => {
    const now = new Date()
    const startDate = new Date(slider.start_at)
    const endDate = new Date(slider.end_at)

    if (!slider.active) return "inactive"
    if (now < startDate) return "scheduled"
    if (now > endDate) return "expired"
    return "active"
}

// Columns definition for sliders table
export const slidersColumns: TableColumn<Slider>[] = [
    {
        key: "image_url",
        label: "الصورة",
        width: "w-32",
        render: (value, row) => {
            // Build full URL if value is image_name (relative path)
            let imageUrl = value
            if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
                imageUrl = `${baseUrl}/storage/${value}`
            }
            
            return (
                <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-muted group">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={row.title.ar}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
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
    // {
    //     key: "start_at",
    //     label: "فترة العرض",
    //     sortable: true,
    //     width: "min-w-[200px]",
    //     render: (value, row) => (
    //         <div className="space-y-1">
    //             <div className="flex items-center gap-2 text-xs">
    //                 <Calendar className="h-3 w-3 text-green-600" />
    //                 <span className="text-muted-foreground">من:</span>
    //                 <span className="font-medium">
    //                     {format(new Date(value), "dd MMM yyyy", { locale: ar })}
    //                 </span>
    //             </div>
    //             <div className="flex items-center gap-2 text-xs">
    //                 <Calendar className="h-3 w-3 text-red-600" />
    //                 <span className="text-muted-foreground">إلى:</span>
    //                 <span className="font-medium">
    //                     {format(new Date(row.end_at), "dd MMM yyyy", { locale: ar })}
    //                 </span>
    //             </div>
    //         </div>
    //     ),
    // },
    // {
    //     key: "active",
    //     label: "الحالة",
    //     sortable: true,
    //     width: "w-32",
    //     render: (value, row) => {
    //         const status = getSliderStatus(row)
    //         const statusConfig = {
    //             active: {
    //                 label: "نشط",
    //                 icon: Eye,
    //                 className: "bg-green-500",
    //             },
    //             inactive: {
    //                 label: "معطل",
    //                 icon: EyeOff,
    //                 className: "bg-gray-500",
    //             },
    //             scheduled: {
    //                 label: "مجدول",
    //                 icon: Calendar,
    //                 className: "bg-blue-500",
    //             },
    //             expired: {
    //                 label: "منتهي",
    //                 icon: Calendar,
    //                 className: "bg-red-500",
    //             },
    //         }

    //         const config = statusConfig[status]
    //         const Icon = config.icon

    //         return (
    //             <Badge variant={status === "active" ? "default" : "secondary"} className={config.className}>
    //                 <Icon className="h-3 w-3 mr-1" />
    //                 {config.label}
    //             </Badge>
    //         )
    //     },
    // },
    // {
    //     key: "clicks",
    //     label: "النقرات",
    //     sortable: true,
    //     width: "w-24",
    //     render: (value) => (
    //         <div className="flex items-center gap-2">
    //             <div className="h-8 w-14 rounded-lg bg-amber-500/10 flex items-center justify-center">
    //                 <span className="text-sm font-bold text-amber-600">{value || 0}</span>
    //             </div>
    //             <MousePointer2 className="h-3 w-3 text-muted-foreground" />
    //         </div>
    //     ),
    // },
]

