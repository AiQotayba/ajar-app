"use client"

import * as React from "react"
import { Type, Languages, AlignLeft, Hash, ToggleLeft, Calendar, Code, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TableColumn } from "@/components/table/table-core"
import type { Setting } from "@/lib/types/setting"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"

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
        app_name2: "اسم التطبيق",
        "about-app-ar": "نبذة عن التطبيق بالعربية",
        "about-app-en": "نبذة عن التطبيق بالانجليزية", 
        currency: "العملة",
        phone: "رقم الهاتف",
        "policy-ar": "سياسة الخصوصية بالعربية",
        "policy-en": "سياسة الخصوصية بالانجليزية",
        "terms-ar": "الشروط والأحكام بالعربية",
        "terms-en": "الشروط والأحكام بالانجليزية",
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

const SettingsValue = ({ value, row }: { value: string, row: Setting }) => {
    const [open, setOpen] = useState(false)
    return (
        <p className="flex items-center justify-between group text-sm text-foreground line-clamp-2 max-w-md">
            {row.type !== "html" && value}
            {row.type === "html" && <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Eye /> 
                <p className="">عرض html</p>
            </Button>}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <div className="text-sm max-h-[80vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: value }} />
                </DialogContent>
            </Dialog>
        </p>
    )
}
// Columns definition for settings table with inline editing
export const getSettingsColumns = (): TableColumn<Setting>[] => [
    {
        key: "key",
        label: "اسم الإعداد",
        sortable: true,
        width: "min-w-[150px]",
        render: (value) => {
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
        key: "type",
        label: "النوع",
        sortable: true,
        width: "w-24",
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
    {
        key: "value",
        label: "القيمة",
        width: "min-w-[300px]",
        render: (value, row) => <SettingsValue value={value} row={row} />
    },
]

