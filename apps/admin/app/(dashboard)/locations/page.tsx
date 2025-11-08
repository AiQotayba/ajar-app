"use client"

import * as React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapPin } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import type { Governorate } from "@/lib/types/location"
import { api } from "@/lib/api"
import { GovernorateAccordion, CitiesDetailSidebar } from "@/components/pages/locations"

export default function LocationsPage() {
    const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null)

    const { data: governoratesData, isLoading } = useQuery({
        queryKey: ["governorates"],
        queryFn: async () => {
            const response = await api.get<{ data: Governorate[] }>('/admin/governorates')
            return response.data
        },
    })

    const governorates = governoratesData?.data || []

    const handleSelectGovernorate = (governorate: Governorate | null) => {
        setSelectedGovernorate(governorate)
        console.info("✅ Selected governorate:", governorate?.name.ar || governorate?.name.en)
    }

    // Governorates Skeleton Component
    const GovernoratesSkeleton = () => (
        <div className="space-y-3" dir="rtl">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <div className="flex h-full flex-col">
            <div className="border-b p-6">
                <PageHeader
                    title="إدارة المواقع"
                    description="إدارة المحافظات والمدن في النظام. اختر محافظة لعرض مدنها وإدارتها"
                    icon={MapPin}
                />
            </div>

            <div className="overflow-hidden grid grid-cols-1 lg:grid-cols-3 h-full">
                {/* Sidebar على اليسار - Governorates List */}
                <div className="col-span-1 overflow-auto bg-muted/30 p-6">
                    {isLoading ? (
                        <GovernoratesSkeleton />
                    ) : (
                        <GovernorateAccordion
                            governorates={governorates}
                            onSelectGovernorate={handleSelectGovernorate}
                            selectedGovernorate={selectedGovernorate}
                        />
                    )}
                </div>

                {/* Sidebar على اليمين - Cities Detail */}
                <CitiesDetailSidebar
                    governorate={selectedGovernorate}
                />
            </div>
        </div>
    )
}

