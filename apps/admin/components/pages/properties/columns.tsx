"use client"

import * as React from "react"
import { Type, Hash, ToggleLeft, Database, Filter as FilterIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TableColumn } from "@/components/table/table-core"
import type { CategoryProperty } from "@/lib/types/category"

const getDataTypeIcon = (dataType: string) => {
    const icons: Record<string, any> = {
        string: Type,
        int: Hash,
        float: Hash,
        bool: ToggleLeft,
        select: Database,
    }
    return icons[dataType] || Type
}

export const propertiesColumns: TableColumn<CategoryProperty>[] = [
    {
        key: "name",
        label: "اسم الخاصية",
        sortable: true,
        width: "min-w-[200px]",
        render: (value) => (
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{value?.ar}</p>
                <p className="text-xs text-muted-foreground">{value?.en}</p>
            </div>
        ),
    },
    {
        key: "type",
        label: "نوع البيانات",
        sortable: true,
        width: "w-40",
        render: (value) => {
            const typeConfig: Record<string, any> = {
                string: { label: "نص", color: "bg-blue-100 text-blue-700 border-blue-300" },
                int: { label: "رقم", color: "bg-purple-100 text-purple-700 border-purple-300" },
                float: { label: "عدد عشري", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                bool: { label: "نعم/لا", color: "bg-green-100 text-green-700 border-green-300" },
                select: { label: "اختيار", color: "bg-orange-100 text-orange-700 border-orange-300" },
            }
            const config = typeConfig[value as string]
            const Icon = getDataTypeIcon(value)

            return (
                <Badge variant="outline" className={`gap-1 ${config?.color}`}>
                    <Icon className="h-3 w-3" />
                    {config?.label}
                </Badge>
            )
        },
    },
    {
        key: "is_filter",
        label: "فلتر",
        width: "w-24",
        render: (value) =>
            value ? (
                <Badge variant="secondary" className="text-xs">
                    <FilterIcon className="h-3 w-3 mr-1" />
                    فلتر
                </Badge>
            ) : (
                <span className="text-xs text-muted-foreground">-</span>
            ),
    },
    {
        key: "sort_order",
        label: "الترتيب",
        sortable: true,
        width: "w-24",
        render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
]

