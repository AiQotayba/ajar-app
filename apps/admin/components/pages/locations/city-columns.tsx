"use client"

import * as React from "react"
import { Building2, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TableColumn } from "@/components/table/table-core"
import type { City } from "@/lib/types/location"

// Cities columns definition
export const citiesColumns: TableColumn<City>[] = [
    {
        key: "name",
        label: "اسم المدينة",
        sortable: true,
        width: "min-w-[300px]",
        render: (value, row) => (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <p className="font-semibold text-foreground">{value?.ar}</p>
                </div>
                <p className="text-xs text-muted-foreground">{value?.en}</p>
                {row.governorate && (
                    <Badge variant="outline" className="text-xs">
                        {row.governorate.name.ar}
                    </Badge>
                )}
            </div>
        ),
    },
    {
        key: "listings_count",
        label: "الإعلانات",
        sortable: true,
        width: "w-36",
        render: (value) => (
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{value || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground">إعلان</span>
            </div>
        ),
    },
    {
        key: "is_active",
        label: "الحالة",
        sortable: true,
        width: "w-28",
        render: (value) => (
            <Badge variant={value !== false ? "default" : "secondary"} className={value !== false ? "bg-green-500" : ""}>
                {value !== false ? (
                    <>
                        <Eye className="h-3 w-3 mr-1" />
                        نشطة
                    </>
                ) : (
                    <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        معطلة
                    </>
                )}
            </Badge>
        ),
    },
]

