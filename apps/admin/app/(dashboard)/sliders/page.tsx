"use client"

import * as React from "react"
import { Plus, Image as ImageIcon } from "lucide-react"
import { TableCore } from "@/components/table/table-core"
import type { Slider } from "@/lib/types/slider"
import { PageHeader } from "@/components/dashboard/page-header"
import { slidersColumns, SliderForm, SliderView } from "@/components/pages/sliders"

export default function SlidersPage() {
    const [formOpen, setFormOpen] = React.useState(false)
    const [viewOpen, setViewOpen] = React.useState(false)
    const [selectedSlider, setSelectedSlider] = React.useState<Slider | null>(null)
    const [formMode, setFormMode] = React.useState<"create" | "update">("create")
    const UrlEndpoint = "/admin/sliders"
    const handleView = (slider: Slider) => {
        setSelectedSlider(slider)
        setViewOpen(true)
    }

    const handleEdit = (slider: Slider) => {
        setSelectedSlider(slider)
        setFormMode("update")
        setFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedSlider(null)
        setFormMode("create")
        setFormOpen(true)
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <PageHeader
                title="إدارة السلايدر"
                description="إدارة شرائح العرض الرئيسية في الصفحة الرئيسية"
                icon={ImageIcon}
                actions={[
                    {
                        label: "إضافة سلايد جديد",
                        icon: Plus,
                        onClick: handleCreate,
                    }
                ]}
            />

            <TableCore<Slider>
                columns={slidersColumns}
                apiEndpoint={UrlEndpoint}
                enableDragDrop={true}
                enableActions={true}
                enableSortOrder={true}
                actions={{
                    onView: handleView,
                    onEdit: handleEdit,
                }}
                enableView={true}
                enableEdit={true}
                enableDelete={true}
                enableDateRange={true}
                searchPlaceholder="ابحث في السلايدات..."
                emptyMessage="لا توجد سلايدات."
                skeletonRows={5}
                skeletonVariant="comfortable"
                // Delete dialog props
                deleteTitle="تأكيد حذف السلايد"
                deleteDescription={(slider) => `هل أنت متأكد من حذف السلايد "${slider.title.ar}"؟`}
                deleteWarning={(slider) =>
                    slider.clicks && slider.clicks > 0
                        ? `تحذير: هذا السلايد حصل على ${slider.clicks} نقرة`
                        : null
                }
            />

            {/* Slider Form Dialog */}
            <SliderForm
                open={formOpen}
                onOpenChange={setFormOpen}
                urlEndpoint={UrlEndpoint}
                slider={selectedSlider}
                mode={formMode}
            />

            {/* Slider View Dialog */}
            <SliderView
                open={viewOpen}
                onOpenChange={setViewOpen}
                urlEndpoint={UrlEndpoint}
                slider={selectedSlider}
            />
        </div>
    )
}

