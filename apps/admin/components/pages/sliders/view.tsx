"use client"

import * as React from "react"
import { Calendar, Link2, MousePointer2, Eye, EyeOff, User } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Slider } from "@/lib/types/slider"
import { getSliderStatus } from "./columns"
import Images from "@/components/ui/image"

interface SliderViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    slider: Slider | null
}

export function SliderView({ open, onOpenChange, urlEndpoint, slider }: SliderViewProps) {
    if (!slider) return null

    // Build full URL if image_url is image_name (relative path)
    let imageUrl = slider.image_url
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
        imageUrl = `${baseUrl}/storage/${imageUrl}`
    }

    const status = getSliderStatus(slider)
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
    const StatusIcon = config.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>تفاصيل السلايد</span>
                        <Badge variant={status === "active" ? "default" : "secondary"} className={config.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        عرض كامل لتفاصيل السلايد
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Image */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">الصورة</h3>
                        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                            {imageUrl ? (
                                <Images
                                    src={imageUrl}
                                    alt={slider.title.ar}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <p className="text-muted-foreground">لا توجد صورة</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Title & Description */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">العنوان</h3>
                            <div className="space-y-1">
                                <p className="text-base font-semibold">{slider.title.ar}</p>
                                <p className="text-sm text-muted-foreground">{slider.title.en}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">الوصف</h3>
                            <div className="space-y-1">
                                <p className="text-sm">{slider.description.ar}</p>
                                <p className="text-sm text-muted-foreground">{slider.description.en}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Links & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Link2 className="h-4 w-4" />
                                الرابط المستهدف
                            </h3>
                            <a
                                href={slider.target_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline break-all"
                            >
                                {slider.target_url}
                            </a>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MousePointer2 className="h-4 w-4" />
                                عدد النقرات
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-16 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <span className="text-lg font-bold text-amber-600">{slider.clicks || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-green-600" />
                                تاريخ البداية
                            </h3>
                            <p className="text-sm font-medium">
                                {format(new Date(slider.start_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-red-600" />
                                تاريخ النهاية
                            </h3>
                            <p className="text-sm font-medium">
                                {format(new Date(slider.end_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Created by User */}
                    {slider.user && (
                        <>
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    تم الإنشاء بواسطة
                                </h3>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={slider.user.avatar_url || undefined} />
                                        <AvatarFallback>
                                            {slider.user.first_name[0]}{slider.user.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{slider.user.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{slider.user.email}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                            <span className="font-medium">تاريخ الإنشاء: </span>
                            {format(new Date(slider.created_at), "dd MMM yyyy - HH:mm", { locale: ar })}
                        </div>
                        <div>
                            <span className="font-medium">آخر تحديث: </span>
                            {format(new Date(slider.updated_at), "dd MMM yyyy - HH:mm", { locale: ar })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

