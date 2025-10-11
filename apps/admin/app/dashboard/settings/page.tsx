"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Settings as SettingsIcon, Type, DollarSign, Link2, Languages } from "lucide-react"
import { TableCore, type TableColumn, type TableFilter } from "@/components/table/table-core"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { settingsApi } from "@/lib/api/settings"
import type { Setting } from "@/lib/types/setting"
import { PageHeader } from "@/components/dashboard/page-header"

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [editingId, setEditingId] = React.useState<number | null>(null)
    const [editValue, setEditValue] = React.useState("")

    // Get icon for setting type
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "text":
                return Type
            case "number":
                return DollarSign
            case "json":
                return Languages
            default:
                return Type
        }
    }

    // Get readable key name
    const getKeyLabel = (key: string) => {
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

    // Handle edit
    const handleEdit = (setting: Setting) => {
        setEditingId(setting.id)
        setEditValue(setting.value)
    }

    // Handle save
    const handleSave = async (setting: Setting) => {
        try {
            const response = await settingsApi.update(setting.id, { value: editValue })

            if (response.message) {
                toast.success(response.message)
            } else {
                toast.success("تم تحديث الإعداد بنجاح")
            }

            queryClient.invalidateQueries({ queryKey: ["table-data"] })
            setEditingId(null)
            setEditValue("")
        } catch (error) {
            toast.error("فشل تحديث الإعداد")
        }
    }

    // Handle cancel edit
    const handleCancel = () => {
        setEditingId(null)
        setEditValue("")
    }

    // Columns definition
    const columns: TableColumn<Setting>[] = [
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
                            {/* <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-2">
                                <TypeIcon className="h-4 w-4 text-primary" />
                            </div> */}
                            <div>
                                <p className="font-semibold text-foreground" dir="rtl">{getKeyLabel(value)}@</p>
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
                const isEditing = editingId === row.id

                if (isEditing) {
                    return (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSave(row)
                                    } else if (e.key === "Escape") {
                                        handleCancel()
                                    }
                                }}
                            />
                            <Button
                                size="sm"
                                onClick={() => handleSave(row)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                حفظ
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                            >
                                إلغاء
                            </Button>
                        </div>
                    )
                }

                return (
                    <div className="flex items-center justify-between group">
                        <p className="text-sm text-foreground line-clamp-2 max-w-md">
                            {value || <span className="text-muted-foreground italic">فارغ</span>}
                        </p>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(row)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            تعديل
                        </Button>
                    </div>
                )
            },
        },
        {
            key: "type",
            label: "النوع",
            sortable: true,
            width: "w-32",
            render: (value) => {
                const typeConfig = {
                    text: { label: "نص", className: "bg-blue-500" },
                    number: { label: "رقم", className: "bg-green-500" },
                    boolean: { label: "منطقي", className: "bg-purple-500" },
                    json: { label: "JSON", className: "bg-amber-500" },
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

    const filters: TableFilter[] = [
        {
            key: "type",
            label: "نوع الإعداد",
            type: "select",
            options: [
                { label: "نص", value: "text" },
                { label: "رقم", value: "number" },
                { label: "منطقي", value: "boolean" },
                { label: "JSON", value: "json" },
            ],
        },
    ]

    const handleView = (setting: Setting) => {
        toast.info(`عرض الإعداد: ${getKeyLabel(setting.key)}`, {
            description: `القيمة: ${setting.value}`,
        })
    }

    const handleDelete = async (setting: Setting) => {
        const response = await settingsApi.delete(setting.id)
        queryClient.invalidateQueries({ queryKey: ["table-data"] })

        if (response.message) {
            toast.success(response.message)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="إعدادات التطبيق"
                description="إدارة إعدادات التطبيق العامة والنصوص والروابط الخارجية"
                icon={SettingsIcon}
                action={{
                    label: "إضافة إعداد جديد",
                    icon: Plus,
                    onClick: () => toast.info("سيتم فتح نافذة إضافة إعداد"),
                }}
            />

            <TableCore<Setting>
                columns={columns}
                filters={filters}
                apiEndpoint="/admin/settings"
                enableDragDrop={false}
                enableActions={true}
                enableSortOrder={false}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                }}
                enableDelete={false}
                enableDateRange={false}
                searchPlaceholder="ابحث في الإعدادات..."
                emptyMessage="لا توجد إعدادات."
                skeletonRows={10}
                skeletonVariant="comfortable"
                deleteTitle="تأكيد حذف الإعداد"
                deleteDescription={(setting) => `هل أنت متأكد من حذف الإعداد "${getKeyLabel(setting.key)}"؟`}
                deleteWarning={(setting) =>
                    setting.is_settings
                        ? "تحذير: هذا إعداد نظام أساسي، حذفه قد يؤثر على عمل التطبيق"
                        : null
                }
                onDeleteConfirm={handleDelete}
            />
        </div>
    )
}

