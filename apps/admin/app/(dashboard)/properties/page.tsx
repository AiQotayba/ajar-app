"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Eye, EyeOff, Database, Type, Hash, ToggleLeft, Filter as FilterIcon, CheckCircle2 } from "lucide-react"
import { TableCore, type TableColumn, type TableFilter } from "@/components/table/table-core"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { propertiesApi } from "@/lib/api/properties"
import type { Property } from "@/lib/types/property"
import { StatsGrid, type StatCard } from "@/components/dashboard/stats-grid"
import { PageHeader } from "@/components/dashboard/page-header"

export default function PropertiesPage() {
    const queryClient = useQueryClient()

    // Toggle visibility mutation
    const toggleVisibilityMutation = useMutation({
        mutationFn: ({ id, is_visible }: { id: number; is_visible: boolean }) =>
            propertiesApi.toggleVisibility(id, is_visible),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["table-data"] })
            toast.success("تم تحديث حالة الظهور بنجاح")
        },
        onError: () => {
            toast.error("فشل تحديث حالة الظهور")
        },
    })

    // Data type icons
    const getDataTypeIcon = (dataType: Property['data_type']) => {
        const icons = {
            string: Type,
            int: Hash,
            float: Hash,
            bool: ToggleLeft,
            select: Database,
            multi_select: FilterIcon,
        }
        return icons[dataType] || Type
    }

    const columns: TableColumn<Property>[] = [
        {
            key: "name",
            label: "اسم الخاصية",
            sortable: true,
            render: (value, row) => (
                <div className="space-y-1 max-w-[250px]">
                    <p className="font-semibold text-foreground">{value?.ar}</p>
                    <p className="text-xs text-muted-foreground">{value?.en}</p>
                    {row.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                            {row.category.name.ar}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: "type",
            label: "نوع البيانات",
            sortable: true,
            render: (value) => {
                console.log(value)

                const typeConfig = {
                    string: { label: "نص", color: "bg-blue-100 text-blue-700 border-blue-300" },
                    int: { label: "رقم", color: "bg-purple-100 text-purple-700 border-purple-300" },
                    float: { label: "عدد عشري", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                    bool: { label: "نعم/لا", color: "bg-green-100 text-green-700 border-green-300" },
                    select: { label: "اختيار", color: "bg-orange-100 text-orange-700 border-orange-300" },
                    multi_select: { label: "اختيار متعدد", color: "bg-pink-100 text-pink-700 border-pink-300" },
                }
                const config = typeConfig[value as keyof typeof typeConfig]
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
            key: "options",
            label: "الخيارات",
            render: (value) => {
                if (!value || !Array.isArray(value) || value.length === 0) {
                    return <span className="text-xs text-muted-foreground">-</span>
                }
                return (
                    <div className="flex flex-wrap gap-2  ">
                        {value.slice(0, 3).map((option, i) => (
                            <div key={i} className="flex flex-col gap-0.5">
                                <Badge variant="secondary" className="text-xs font-medium">
                                    {option.ar}
                                </Badge>
                            </div>
                        ))}
                        {value.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{value.length - 3} خيار
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            key: "is_visible",
            label: "الحالة",
            sortable: true,
            render: (value) => (
                <Badge
                    variant={value ? "default" : "secondary"}
                    className={value ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-muted"}
                >
                    {value ? (
                        <>
                            <Eye className="h-3 w-3 mr-1" />
                            ظاهرة
                        </>
                    ) : (
                        <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            مخفية
                        </>
                    )}
                </Badge>
            ),
        },
    ]

    const filters: TableFilter[] = [
        {
            key: "data_type",
            label: "نوع البيانات",
            type: "select",
            options: [
                { label: "نص", value: "text" },
                { label: "رقم", value: "number" },
                { label: "نعم/لا", value: "boolean" },
                { label: "اختيار", value: "select" },
                { label: "اختيار متعدد", value: "multi_select" },
            ],
        },
        {
            key: "is_required",
            label: "مطلوب",
            type: "select",
            options: [
                { label: "مطلوب", value: "1" },
                { label: "اختياري", value: "0" },
            ],
        },
        {
            key: "is_filterable",
            label: "قابل للتصفية",
            type: "select",
            options: [
                { label: "نعم", value: "1" },
                { label: "لا", value: "0" },
            ],
        },
        {
            key: "is_visible",
            label: "الحالة",
            type: "select",
            options: [
                { label: "ظاهرة", value: "1" },
                { label: "مخفية", value: "0" },
            ],
        },
    ]

    const handleView = (property: Property) => {
        toast.info(`عرض الخاصية: ${property.name.ar}`, {
            description: `النوع: ${property.data_type} | الرقم: ${property.id}`,
        })
    }

    const handleEdit = (property: Property) => {
        toast.success(`تعديل الخاصية: ${property.name.ar}`, {
            description: "سيتم فتح نافذة التعديل",
        })
    }

    const handleDelete = async (property: Property) => {
        const response = await propertiesApi.delete(property.id)
        queryClient.invalidateQueries({ queryKey: ["table-data"] })
        
        // عرض رسالة من API
        if (response.message) {
            toast.success(response.message)
        }
    }


    return (
        <div className="space-y-4 md:space-y-6">
            <PageHeader
                title="إدارة الخصائص"
                description="إدارة خصائص الإعلانات وأنواع البيانات والتحقق من الصحة"
                icon={Database} 
                actions={[
                    {
                        label: "إضافة خاصية جديدة",
                        icon: Plus,
                        onClick: () => toast.info("سيتم فتح نافذة إضافة خاصية"),
                    }
                ]}
            />

            {/* Table */}
            <TableCore<Property>
                columns={columns}
                filters={filters}
                apiEndpoint="/admin/properties"
                enableDragDrop={true}
                enableActions={true}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                }}
                enableView={true}
                enableEdit={true}
                enableDelete={true}
                enableDateRange={false}
                searchPlaceholder="ابحث في الخصائص بالاسم أو الوصف..."
                emptyMessage="لا توجد خصائص. حاول تعديل الفلاتر أو إضافة خاصية جديدة."
                skeletonRows={8}
                skeletonVariant="default"
                deleteTitle="تأكيد حذف الخاصية"
                deleteDescription={(property) => `هل أنت متأكد من حذف الخاصية "${property.name.ar}"؟`}
                deleteWarning={(property) =>
                    property.usage_count && property.usage_count > 0
                        ? `تحذير: هذه الخاصية مستخدمة في ${property.usage_count} إعلان`
                        : null
                }
                onDeleteConfirm={handleDelete}
            />
        </div>
    )
}

