"use client"

import * as React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { MapPin, Building2, Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react"
import type { Governorate, City } from "@/lib/types/location"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { CityForm } from "./city-form"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"

interface CitiesDetailSidebarProps {
    governorate: Governorate | null
    onEdit?: (governorate: Governorate) => void
    onDelete?: (governorate: Governorate) => void
}

export function CitiesDetailSidebar({ governorate, onEdit, onDelete }: CitiesDetailSidebarProps) {
    const queryClient = useQueryClient()

    const [isCityFormOpen, setIsCityFormOpen] = useState(false)
    const [isDeleteCityDialogOpen, setIsDeleteCityDialogOpen] = useState(false)
    const [editingCity, setEditingCity] = useState<City | null>(null)
    const [deletingCity, setDeletingCity] = useState<City | null>(null)
    const cityEndpoint = "/admin/cities"

    // Fetch cities for the selected governorate
    const { data: cities = [], isLoading: isLoadingCities } = useQuery({
        queryKey: ["cities", governorate?.id],
        queryFn: async () => {
            if (!governorate?.id) return []
            const response = await api.get(`/admin/cities?governorate_id=${governorate.id}`)
            if (response.isError) {
                console.error("❌ Error fetching cities:", response.message)
                return []
            }
            // API returns { data: City[] } or { data: { data: City[] } }
            return response.data?.data || response.data || []
        },
        enabled: !!governorate?.id,
    })

    // Delete City Mutation
    const deleteCityMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/cities/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cities", governorate?.id] })
            queryClient.invalidateQueries({ queryKey: ["table-data", cityEndpoint] })
            queryClient.invalidateQueries({ queryKey: ["governorates"] })
            toast.success("تم حذف المدينة بنجاح")
            setIsDeleteCityDialogOpen(false)
            setDeletingCity(null)
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "فشل حذف المدينة"
            toast.error(errorMessage)
        },
    })

    const handleEditCity = (city: City) => {
        setEditingCity(city)
        setIsCityFormOpen(true)
    }

    const handleDeleteCity = (city: City) => {
        setDeletingCity(city)
        setIsDeleteCityDialogOpen(true)
    }

    const handleDeleteCityConfirm = () => {
        if (deletingCity) {
            deleteCityMutation.mutate(deletingCity.id)
        }
    }

    const handleCreateCity = () => {
        setEditingCity(null)
        setIsCityFormOpen(true)
    }

    const handleCityFormClose = (open: boolean) => {
        setIsCityFormOpen(open)
        if (!open) {
            setEditingCity(null)
            // Refresh cities list after form closes
            queryClient.invalidateQueries({ queryKey: ["cities", governorate?.id] })
        }
    }

    if (!governorate) {
        return (
            <>
                <CityForm
                    open={isCityFormOpen}
                    onOpenChange={handleCityFormClose}
                    urlEndpoint={cityEndpoint}
                    city={editingCity}
                    mode={editingCity ? "update" : "create"}
                />
                <aside className="col-span-1 lg:col-span-2 w-full border-r bg-card flex justify-center items-center lg:block overflow-y-auto my-6" dir="rtl">
                    <div className="p-8 flex flex-col items-center justify-center">
                        {/* Icon with gradient background */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl" />
                            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                                <MapPin className="w-16 h-16 text-primary" />
                            </div>
                        </div>

                        {/* Title and Description */}
                        <div className="text-center space-y-3 mb-8 max-w-md">
                            <h3 className="text-xl font-bold text-foreground">لا توجد محافظة محددة</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                اختر محافظة من القائمة الجانبية لعرض مدنها وإدارتها
                            </p>
                        </div>
                    </div>
                </aside>
            </>
        )
    }

    return (
        <>
            <CityForm
                open={isCityFormOpen}
                onOpenChange={handleCityFormClose}
                urlEndpoint={cityEndpoint}
                city={editingCity}
                mode={editingCity ? "update" : "create"}
                defaultGovernorateId={governorate?.id}
            />

            <AlertDialog open={isDeleteCityDialogOpen} onOpenChange={setIsDeleteCityDialogOpen}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد حذف المدينة</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف المدينة "{deletingCity?.name.ar}"؟
                            {deletingCity?.listings_count && deletingCity.listings_count > 0 && (
                                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive">
                                    تحذير: هذه المدينة تحتوي على {deletingCity.listings_count} إعلان
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCityConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <aside className="col-span-1 lg:col-span-2 w-full border-r bg-card overflow-y-auto" >
                <ScrollArea className="h-full">
                    <div className="p-6 space-y-6" dir="rtl">
                        {/* Governorate Header */}
                        <div className="border-b pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{governorate.name.ar}</h2>
                                        {governorate.name.en && (
                                            <p className="text-sm text-muted-foreground">{governorate.name.en}</p>
                                        )}
                                    </div>
                                </div>
                                <Badge variant={governorate.is_active !== false ? "default" : "secondary"}>
                                    {governorate.is_active !== false ? (
                                        <>
                                            <Eye className="h-3 w-3 ml-1" />
                                            نشطة
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-3 w-3 ml-1" />
                                            معطلة
                                        </>
                                    )}
                                </Badge>
                            </div>

                            {/* Governorate Stats */}
                            <div className="flex flex-row items-center gap-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="h-6 w-6 text-primary/70" />
                                    <span className="text-xs font-bold text-muted-foreground">المدن</span>
                                    <p className="text-md font-bold bg-primary/10 text-primary rounded-lg min-w-10 text-center">{cities.length || 0}</p>
                                </div>
                            </div>

                            {/* Code */}
                            {governorate.code && (
                                <div className="mt-3 text-xs text-muted-foreground">
                                    <span className="font-medium">الكود:</span>
                                    <code className="mr-2 px-2 py-1 bg-muted rounded">{governorate.code}</code>
                                </div>
                            )}
                        </div>

                        {/* Cities Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">المدن</h3>
                                <Button onClick={handleCreateCity} size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    إضافة مدينة
                                </Button>
                            </div>

                            {isLoadingCities ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : cities.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>لا توجد مدن في هذه المحافظة</p>
                                    <Button onClick={handleCreateCity} variant="outline" size="sm" className="mt-4">
                                        <Plus className="h-4 w-4 ml-2" />
                                        إضافة مدينة
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {cities.map((city: City) => (
                                        <div
                                            key={city.id}
                                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Building2 className="h-4 w-4 text-purple-600" />
                                                        <h4 className="font-semibold">{city.name.ar}</h4>
                                                    </div>
                                                    {city.name.en && (
                                                        <p className="text-sm text-muted-foreground mb-2">{city.name.en}</p>
                                                    )}

                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant={city.is_active !== false ? "default" : "secondary"}>
                                                            {city.is_active !== false ? (
                                                                <>
                                                                    <Eye className="h-3 w-3 ml-1" />
                                                                    نشطة
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <EyeOff className="h-3 w-3 ml-1" />
                                                                    معطلة
                                                                </>
                                                            )}
                                                        </Badge>

                                                        {city.listings_count !== undefined && (
                                                            <Badge variant="outline">
                                                                {city.listings_count} إعلان
                                                            </Badge>
                                                        )}

                                                        {city.code && (
                                                            <Badge variant="outline" className="text-xs">
                                                                كود: {city.code}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditCity(city)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteCity(city)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Footer Info */}
                            <div className="pt-4 border-t text-xs text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>#{governorate.id}</span>
                                    <span>{format(new Date(governorate.created_at), "dd MMM yyyy", { locale: ar })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </aside>
        </>
    )
}

