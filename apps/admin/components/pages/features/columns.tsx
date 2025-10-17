"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import type { TableColumn } from "@/components/table/table-core"
import type { CategoryFeature } from "@/lib/types/category"

export const featuresColumns: TableColumn<CategoryFeature>[] = [
    {
        key: "name",
        label: "اسم الميزة",
        sortable: true,
        width: "min-w-[200px]",
        render: (value, row) => (
            <div className="flex items-center gap-2">
                {row.icon && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 flex items-center justify-center text-lg">
                        {row.icon}
                    </div>
                )}
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">{value?.ar}</p>
                    <p className="text-xs text-muted-foreground">{value?.en}</p>
                </div>
            </div>
        ),
    },
    {
        key: "description",
        label: "الوصف",
        width: "min-w-[200px]",
        render: (value) => {
            if (!value?.ar && !value?.en) {
                return <span className="text-xs text-muted-foreground">-</span>
            }
            return (
                <div className="space-y-0.5">
                    {value?.ar && <p className="text-xs text-foreground line-clamp-2">{value.ar}</p>}
                    {value?.en && <p className="text-[10px] text-muted-foreground line-clamp-1">{value.en}</p>}
                </div>
            )
        },
    },
    {
        key: "sort_order",
        label: "الترتيب",
        sortable: true,
        width: "w-24",
        render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
]

