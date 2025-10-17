"use client"

import * as React from "react"
import { Type, DollarSign, Languages, AlignLeft, Hash, ToggleLeft, Calendar, Code } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TableColumn } from "@/components/table/table-core"
import type { Setting } from "@/lib/types/setting"

// Get icon for setting type
export const getTypeIcon = (type: string) => {
    switch (type) {
        case "text":
            return Type
        case "long_text":
            return AlignLeft
        case "int":
        case "float":
            return Hash
        case "bool":
            return ToggleLeft
        case "json":
            return Languages
        case "datetime":
            return Calendar
        case "html":
            return Code
        default:
            return Type
    }
}

// Get readable key name
export const getKeyLabel = (key: string) => {
    const labels: Record<string, string> = {
        app_name: "اسم التطبيق",
        currency: "العملة",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        address: "العنوان",
        whatsapp: "رقم الواتساب",
        facebook_url: "رابط فيسبوك",
        twitter_url: "رابط تويتر",
        instagram_url: "رابط إنستغرام",
        about_us: "عن التطبيق",
        terms_and_conditions: "الشروط والأحكام",
        privacy_policy: "سياسة الخصوصية",
    }
    return labels[key] || key
}

// Columns definition for settings table with inline editing
export const getSettingsColumns = (): TableColumn<Setting>[] => [
    {
        key: "key",
        label: "اسم الإعداد",
        sortable: true,
        width: "min-w-[250px]",
        render: (value, row) => {
            const TypeIcon = getTypeIcon(row.type)
            return (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="font-semibold text-foreground" dir="rtl">
                                {getKeyLabel(value)}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {value}
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
    },
    {
        key: "value",
        label: "القيمة",
        width: "min-w-[300px]",
        render: (value, row) => {

            return (
                <div className="flex items-center justify-between group">
                    <p className="text-sm text-foreground line-clamp-2 max-w-md">
                        {value || <span className="text-muted-foreground italic">فارغ</span>}
                    </p>
                </div>
            )
        },
    },
    {
        key: "type",
        label: "النوع",
        sortable: true,
        width: "w-40",
        render: (value) => {
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
            const config = typeConfig[value as keyof typeof typeConfig] || typeConfig.text
            return (
                <Badge className={config.className}>
                    {config.label}
                </Badge>
            )
        },
    },
]

