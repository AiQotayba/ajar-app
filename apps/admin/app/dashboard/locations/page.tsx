"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, MapPin, Building2, Eye, EyeOff, Map } from "lucide-react"
import { TableCore, type TableColumn } from "@/components/table/table-core"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { locationsApi } from "@/lib/api/locations"
import type { Governorate, City } from "@/lib/types/location"
import { PageHeader } from "@/components/dashboard/page-header"

export default function LocationsPage() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = React.useState("governorates")

    // Governorates columns
    const governoratesColumns: TableColumn<Governorate>[] = [
        {
            key: "name",
            label: "اسم المحافظة",
            sortable: true,
            width: "min-w-[250px]", // عرض مخصص للعمود
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
            width: "w-32", // عرض ثابت
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className="bg-purple-500/10 flex gap-2 h-8 items-center justify-center px-4 rounded-lg w-max">
                        <span className="text-sm font-bold text-purple-600">{value?.length == 0 ? 0 : value?.length}</span>
                        <span className="text-xs text-muted-foreground">مدينة</span>
                    </div>
                </div>
            ),
        },
        {
            key: "is_active",
            label: "الحالة",
            sortable: true,
            width: "w-28", // عرض ثابت
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

    // Cities columns
    const citiesColumns: TableColumn<City>[] = [
        {
            key: "name",
            label: "اسم المدينة",
            sortable: true,
            width: "min-w-[300px]", // عرض مخصص للعمود
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
            width: "w-36", // عرض ثابت
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
            width: "w-28", // عرض ثابت
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

    const handleView = (item: Governorate | City) => {
        const name = item.name.ar
        const type = activeTab === 'governorates' ? 'المحافظة' : 'المدينة'
        toast.info(`عرض ${type}: ${name}`, {
            description: `الرقم: ${item.id}`,
        })
    }

    const handleEdit = (item: Governorate | City) => {
        const name = item.name.ar
        const type = activeTab === 'governorates' ? 'المحافظة' : 'المدينة'
        toast.success(`تعديل ${type}: ${name}`, {
            description: "سيتم فتح نافذة التعديل",
        })
    }

    const handleDeleteGovernorate = async (gov: Governorate) => {
        const response = await locationsApi.deleteGovernorate(gov.id)
        queryClient.invalidateQueries({ queryKey: ["table-data"] })
        
        // عرض رسالة من API
        if (response.message) {
            toast.success(response.message)
        }
    }

    const handleDeleteCity = async (city: City) => {
        const response = await locationsApi.deleteCity(city.id)
        queryClient.invalidateQueries({ queryKey: ["table-data"] })
        
        // عرض رسالة من API
        if (response.message) {
            toast.success(response.message)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="إدارة المواقع"
                description="إدارة المحافظات والمدن في النظام"
                icon={MapPin} 
                action={{
                    label: activeTab === 'governorates' ? "إضافة محافظة" : "إضافة مدينة",
                    icon: Plus,
                    onClick: () => toast.info(`سيتم فتح نافذة إضافة ${activeTab === 'governorates' ? 'محافظة' : 'مدينة'}`),
                }}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
                <TabsList className="grid w-full max-w-md grid-cols-2" dir="rtl">
                    <TabsTrigger value="governorates" className="gap-2">
                        <MapPin className="h-4 w-4" />
                        المحافظات
                    </TabsTrigger>
                    <TabsTrigger value="cities" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        المدن
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="governorates" className="mt-6" dir="rtl">
                    <TableCore<Governorate>
                        columns={governoratesColumns}
                        apiEndpoint="/admin/governorates"
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
                        searchPlaceholder="ابحث في المحافظات..."
                        emptyMessage="لا توجد محافظات."
                        skeletonRows={8}
                        deleteTitle="تأكيد حذف المحافظة"
                        deleteDescription={(gov) => `هل أنت متأكد من حذف المحافظة "${gov.name.ar}"؟`}
                        deleteWarning={(gov) =>
                            gov.listings_count && gov.listings_count > 0
                                ? `تحذير: هذه المحافظة تحتوي على ${gov.listings_count} إعلان`
                                : null
                        }
                        onDeleteConfirm={handleDeleteGovernorate}
                    />
                </TabsContent>

                <TabsContent value="cities" className="mt-6" dir="rtl">
                    <TableCore<City>
                        columns={citiesColumns}
                        apiEndpoint="/admin/cities"
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
                        searchPlaceholder="ابحث في المدن..."
                        emptyMessage="لا توجد مدن."
                        skeletonRows={8}
                        deleteTitle="تأكيد حذف المدينة"
                        deleteDescription={(city) => `هل أنت متأكد من حذف المدينة "${city.name.ar}"؟`}
                        deleteWarning={(city) =>
                            city.listings_count && city.listings_count > 0
                                ? `تحذير: هذه المدينة تحتوي على ${city.listings_count} إعلان`
                                : null
                        }
                        onDeleteConfirm={handleDeleteCity}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

