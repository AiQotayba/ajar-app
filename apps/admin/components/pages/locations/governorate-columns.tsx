"use client"

import * as React from "react"
import { MapPin, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { TableColumn } from "@/components/table/table-core"
import type { Governorate } from "@/lib/types/location"

// Governorates columns definition
export const governoratesColumns: TableColumn<Governorate>[] = [
    {
        key: "name",
        label: "اسم المحافظة",
        sortable: true,
        width: "min-w-[250px]",
        render: (value, row) => (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <p className="font-semibold text-foreground">{value?.ar}</p>
                </div>
                <p className="text-xs text-muted-foreground">{value?.en}</p>
            </div>
        ),
    },
    {
        key: "cities",
        label: "المدن",
        sortable: true,
        width: "w-32",
        render: (value) => (
            <div className="flex items-center gap-2">
                <div className="bg-purple-500/10 flex gap-2 h-8 items-center justify-center px-4 rounded-lg w-max">
                    <span className="text-sm font-bold text-purple-600">
                        {value?.length === 0 ? 0 : value?.length || 0}
                    </span>
                    <span className="text-xs text-muted-foreground">مدينة</span>
                </div>
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

