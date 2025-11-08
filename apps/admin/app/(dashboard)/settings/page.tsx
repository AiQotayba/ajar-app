"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, Settings as SettingsIcon } from "lucide-react"
import { TableCore, type TableFilter } from "@/components/table/table-core"
import { api } from "@/lib/api"
import type { Setting } from "@/lib/types/setting"
import { PageHeader } from "@/components/dashboard/page-header"
import { getSettingsColumns, getKeyLabel, SettingForm, SettingView } from "@/components/pages/settings"

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const [formOpen, setFormOpen] = React.useState(false)
    const [viewOpen, setViewOpen] = React.useState(false)
    const [selectedSetting, setSelectedSetting] = React.useState<Setting | null>(null)
    const [formMode, setFormMode] = React.useState<"create" | "update">("create")

    const urlEndpoint = "/admin/settings?is_settings=1"
    // Get columns with inline editing support
    const columns = getSettingsColumns()

    const filters: TableFilter[] = [
        {
            key: "key",
            label: "اسم الإعداد",
            type: "text",
        },
    ]

    const handleView = (setting: Setting) => {
        setSelectedSetting(setting)
        setViewOpen(true)
    }

    const handleEdit = (setting: Setting) => {
        setSelectedSetting(setting)
        setFormMode("update")
        setFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedSetting(null)
        setFormMode("create")
        setFormOpen(true)
    }

    const handleDelete = async (setting: Setting) => {
        await api.delete(`/admin/settings/${setting.id}`)
        queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <PageHeader
                title="إعدادات التطبيق"
                description="إدارة إعدادات التطبيق العامة والنصوص والروابط الخارجية"
                icon={SettingsIcon}
            />

            <TableCore<Setting>
                columns={columns}
                filters={filters}
                apiEndpoint={urlEndpoint}
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

            {/* Setting Form Dialog */}
            <SettingForm
                open={formOpen}
                onOpenChange={setFormOpen}
                urlEndpoint={urlEndpoint}
                setting={selectedSetting}
                mode={formMode}
            />

            {/* Setting View Dialog */}
            <SettingView
                open={viewOpen}
                onOpenChange={setViewOpen}
                urlEndpoint={urlEndpoint}
                setting={selectedSetting}
            />
        </div>
    )
}

