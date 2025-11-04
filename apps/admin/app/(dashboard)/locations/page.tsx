"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, MapPin, Building2 } from "lucide-react"
import { TableCore } from "@/components/table/table-core"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { locationsApi } from "@/lib/api/locations"
import type { Governorate, City } from "@/lib/types/location"
import { PageHeader } from "@/components/dashboard/page-header"
import {
    governoratesColumns,
    GovernorateForm,
    GovernorateView,
    citiesColumns,
    CityForm,
    CityView,
} from "@/components/pages/locations"

export default function LocationsPage() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = React.useState("governorates")

    // Governorates state
    // const [govFormOpen, setGovFormOpen] = React.useState(false)
    const [govViewOpen, setGovViewOpen] = React.useState(false)
    const [selectedGovernorate, setSelectedGovernorate] = React.useState<Governorate | null>(null)
    const [govFormMode, setGovFormMode] = React.useState<"create" | "update">("create")
    const govEndpoint = "/admin/governorates"

    // Cities state
    const [cityFormOpen, setCityFormOpen] = React.useState(false)
    const [cityViewOpen, setCityViewOpen] = React.useState(false)
    const [selectedCity, setSelectedCity] = React.useState<City | null>(null)
    const [cityFormMode, setCityFormMode] = React.useState<"create" | "update">("create")
    const cityEndpoint = "/admin/cities"

    // Governorate handlers
    const handleGovView = (governorate: Governorate) => {
        setSelectedGovernorate(governorate)
        setGovViewOpen(true)
    }

    const handleGovEdit = (governorate: Governorate) => {
        setSelectedGovernorate(governorate)
        setGovFormMode("update")
        // setGovFormOpen(true)
    }

    const handleGovCreate = () => {
        setSelectedGovernorate(null)
        setGovFormMode("create")
        // setGovFormOpen(true)
    }

    // City handlers
    const handleCityView = (city: City) => {
        setSelectedCity(city)
        setCityViewOpen(true)
    }

    const handleCityEdit = (city: City) => {
        setSelectedCity(city)
        setCityFormMode("update")
        setCityFormOpen(true)
    }

    const handleCityCreate = () => {
        setSelectedCity(null)
        setCityFormMode("create")
        setCityFormOpen(true)
    }

    const handleDeleteGovernorate = async (gov: Governorate) => {
        await locationsApi.deleteGovernorate(gov.id)
        queryClient.invalidateQueries({ queryKey: ["table-data", govEndpoint] })
    }

    const handleDeleteCity = async (city: City) => {
        await locationsApi.deleteCity(city.id)
        queryClient.invalidateQueries({ queryKey: ["table-data", cityEndpoint] })
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {activeTab === 'cities' && (
                <PageHeader
                    title="إدارة المواقع"
                    description="إدارة المحافظات والمدن في النظام"
                    icon={MapPin}
                    actions={[
                        { label: "إضافة مدينة", icon: Plus, onClick: handleCityCreate }
                    ]}
                />
            )}
            {activeTab === 'governorates' && (
                <PageHeader
                    title="إدارة المواقع"
                    description="إدارة المحافظات والمدن في النظام"
                    icon={MapPin}
                />
            )}

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
                        apiEndpoint={govEndpoint}
                        enableDragDrop={true}
                        enableActions={true}
                        actions={{
                            onView: handleGovView,
                            onEdit: handleGovEdit,
                        }}
                        enableView={true}
                        enableEdit={false}
                        enableDelete={false}
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
                        apiEndpoint={cityEndpoint}
                        enableDragDrop={true}
                        enableActions={true}
                        actions={{
                            onView: handleCityView,
                            onEdit: handleCityEdit,
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

            {/* Governorate Forms/Views */}
            {/* <GovernorateForm
                open={govFormOpen}
                onOpenChange={setGovFormOpen}
                urlEndpoint={govEndpoint}
                governorate={selectedGovernorate}
                mode={govFormMode}
            /> */}

            <GovernorateView
                open={govViewOpen}
                onOpenChange={setGovViewOpen}
                urlEndpoint={govEndpoint}
                governorate={selectedGovernorate}
            />

            {/* City Forms/Views */}
            <CityForm
                open={cityFormOpen}
                onOpenChange={setCityFormOpen}
                urlEndpoint={cityEndpoint}
                city={selectedCity}
                mode={cityFormMode}
            />

            <CityView
                open={cityViewOpen}
                onOpenChange={setCityViewOpen}
                urlEndpoint={cityEndpoint}
                city={selectedCity}
            />
        </div>
    )
}

