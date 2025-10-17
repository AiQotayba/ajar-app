"use client"

import * as React from "react"
import { Settings as SettingsIcon, Calendar, Code, Type } from "lucide-react"
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
import type { Setting } from "@/lib/types/setting"
import { getKeyLabel, getTypeIcon } from "./columns"

interface SettingViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    setting: Setting | null
}

export function SettingView({ open, onOpenChange, urlEndpoint, setting }: SettingViewProps) {
    if (!setting) return null

    const TypeIcon = getTypeIcon(setting.type)

    const typeConfig = {
        text: { label: "نص", className: "bg-blue-500" },
        long_text: { label: "نص طويل", className: "bg-blue-600" },
        int: { label: "رقم صحيح", className: "bg-green-500" },
        float: { label: "رقم عشري", className: "bg-green-600" },
        bool: { label: "منطقي", className: "bg-purple-500" },
        json: { label: "JSON", className: "bg-amber-500" },
        datetime: { label: "تاريخ", className: "bg-cyan-500" },
        html: { label: "HTML", className: "bg-orange-500" },
    }
    const config = typeConfig[setting.type as keyof typeof typeConfig] || typeConfig.text

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5" />
                            <span>تفاصيل الإعداد</span>
                        </div>
                        <Badge className={config.className}>
                            {config.label}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        عرض كامل لتفاصيل الإعداد
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Key Name */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">اسم الإعداد</h3>
                        <div className="p-4 rounded-lg bg-muted/30">
                            <p className="text-lg font-semibold">{getKeyLabel(setting.key)}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-1">{setting.key}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Value */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            القيمة
                        </h3>
                        <div className="p-4 rounded-lg bg-muted/50 border">
                            {setting.type === "json" ? (
                                <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                                    {JSON.stringify(JSON.parse(setting.value || "{}"), null, 2)}
                                </pre>
                            ) : setting.type === "html" ? (
                                <div className="space-y-2">
                                    <pre className="text-xs font-mono whitespace-pre-wrap break-words bg-muted p-2 rounded">
                                        {setting.value}
                                    </pre>
                                    <Separator />
                                    <div className="text-xs text-muted-foreground">
                                        <strong>معاينة HTML:</strong>
                                        <div 
                                            className="mt-2 p-2 border rounded bg-background"
                                            dangerouslySetInnerHTML={{ __html: setting.value }}
                                        />
                                    </div>
                                </div>
                            ) : setting.type === "bool" ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant={setting.value === "true" ? "default" : "secondary"} 
                                           className={setting.value === "true" ? "bg-green-500" : "bg-gray-500"}>
                                        {setting.value === "true" ? "✓ مفعّل" : "✗ معطّل"}
                                    </Badge>
                                </div>
                            ) : setting.type === "datetime" ? (
                                <p className="text-sm font-medium">
                                    {format(new Date(setting.value), "dd MMMM yyyy - HH:mm", { locale: ar })}
                                </p>
                            ) : (
                                <p className="text-sm leading-relaxed break-words">
                                    {setting.value || <span className="text-muted-foreground italic">فارغ</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                نوع البيانات
                            </h3>
                            <div className="flex items-center gap-2">
                                <TypeIcon className="h-5 w-5 text-primary" />
                                <Badge className={config.className}>
                                    {config.label}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">إعداد نظام</h3>
                            <Badge variant={setting.is_settings ? "default" : "secondary"}>
                                {setting.is_settings ? "نعم" : "لا"}
                            </Badge>
                            {setting.is_settings && (
                                <p className="text-xs text-amber-600 mt-1">
                                    ⚠️ إعداد نظام أساسي، كن حذراً عند التعديل
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span className="font-medium">تاريخ الإنشاء:</span>
                            </div>
                            <p className="pr-5">
                                {format(new Date(setting.created_at), "dd MMM yyyy - HH:mm", { locale: ar })}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span className="font-medium">آخر تحديث:</span>
                            </div>
                            <p className="pr-5">
                                {format(new Date(setting.updated_at), "dd MMM yyyy - HH:mm", { locale: ar })}
                            </p>
                        </div>
                    </div>

                    {/* ID */}
                    <div className="text-xs text-muted-foreground">
                        <span className="font-medium">معرف الإعداد:</span> #{setting.id}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

