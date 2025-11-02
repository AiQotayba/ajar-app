"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { api } from "@/lib/api-client"
import { createListing, updateListing, listingsApi } from "@/lib/api/listings"
import { listingFormSchema, type ListingFormData, type Category, type Governorate, type City } from "./types"
import { SuccessModal } from "./components"
import { LocationPickerMap } from "./components/location-picker-map"
import { ImagesStep } from "./steps/images-step"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { DollarSign } from "lucide-react"
import type { Listing } from "@/lib/types/listing"

interface ListingFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    listing?: Listing | null
    mode?: "create" | "update"
}


export function ListingForm({
    open,
    onOpenChange,
    urlEndpoint,
    listing,
    mode = "create"
}: ListingFormProps) {
    const queryClient = useQueryClient()
    const isEditing = mode === "update" && !!listing
    const [showSuccess, setShowSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form state
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null)
    const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<Category | null>(null)
    const [subCategories, setSubCategories] = useState<Category[]>([])
    const [subSubCategories, setSubSubCategories] = useState<Category[]>([])
    const [availableProperties, setAvailableProperties] = useState<any[]>([])
    const [availableFeatures, setAvailableFeatures] = useState<any[]>([])
    const [isLocationSelected, setIsLocationSelected] = useState(false)
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    // Helper function to validate coordinates
    const validateCoordinates = (lat: any, lng: any): { lat: number; lng: number } => {
        const defaultLat = 34.8021 // Homs, Syria
        const defaultLng = 36.7570

        const numLat = typeof lat === 'number' ? lat : parseFloat(lat)
        const numLng = typeof lng === 'number' ? lng : parseFloat(lng)

        const isValidLat = !isNaN(numLat) && numLat >= -90 && numLat <= 90
        const isValidLng = !isNaN(numLng) && numLng >= -180 && numLng <= 180

        return {
            lat: isValidLat ? numLat : defaultLat,
            lng: isValidLng ? numLng : defaultLng
        }
    }

    // Transform listing data to form data
    const transformListingToFormData = (listing: Listing): Partial<ListingFormData> => {
        const validatedCoords = validateCoordinates(listing.latitude, listing.longitude)

        // Extract media URLs
        const mediaUrls = (listing.media || listing.images || []).map((item) => {
            if (typeof item === 'string') return item
            return item.full_url || item.url || ''
        }).filter(Boolean)

        // Extract properties
        const properties = (listing.properties || []).map((prop: any) => ({
            id: prop.property_id || prop.id,
            value: prop.value || ""
        }))

        // Extract features
        const features = (listing.features || []).map((feature: any) =>
            feature.id?.toString() || feature.toString()
        )

        return {
            title: {
                ar: listing.title?.ar || "",
                en: listing.title?.en || "",
            },
            description: {
                ar: listing.description?.ar || "",
                en: listing.description?.en || "",
            },
            type: listing.type || "",
            availability_status: listing.availability_status || "",
            category_id: listing.category_id?.toString() || "",
            properties,
            features,
            governorate_id: listing.governorate_id?.toString() || "",
            city_id: listing.city_id?.toString() || "",
            latitude: validatedCoords.lat,
            longitude: validatedCoords.lng,
            media: mediaUrls,
            cover_image_index: 0,
            price: listing.price || 0,
            payment_frequency: listing.pay_every?.toString() || "",
            insurance: listing.insurance || 0,
            status: listing.status as "draft" | "active" | "inactive" | "pending" | "rejected" || "in_review",
            is_featured: listing.is_featured || false,
        }
    }

    // Validate initial coordinates
    const initialFormData = listing ? transformListingToFormData(listing) : {}
    const validatedCoords = validateCoordinates(initialFormData?.latitude, initialFormData?.longitude)

    // Initialize React Hook Form
    const methods = useForm<ListingFormData>({
        resolver: zodResolver(listingFormSchema),
        defaultValues: {
            title: {
                ar: initialFormData?.title?.ar || "",
                en: initialFormData?.title?.en || "",
            },
            description: {
                ar: initialFormData?.description?.ar || "",
                en: initialFormData?.description?.en || "",
            },
            type: initialFormData?.type || "",
            category_id: initialFormData?.category_id || "",
            properties: initialFormData?.properties || [],
            features: initialFormData?.features || [],
            governorate_id: initialFormData?.governorate_id || "",
            city_id: initialFormData?.city_id || "",
            latitude: validatedCoords.lat,
            longitude: validatedCoords.lng,
            media: initialFormData?.media || [],
            cover_image_index: initialFormData?.cover_image_index || 0,
            price: initialFormData?.price || 0,
            payment_frequency: initialFormData?.payment_frequency || "",
            insurance: initialFormData?.insurance || 0,
            status: initialFormData?.status || "draft",
            is_featured: initialFormData?.is_featured || false,
        },
        mode: "onChange"
    })

    const { watch, setValue, handleSubmit, reset, formState: { errors } } = methods

    // Reset form when listing changes
    useEffect(() => {
        if (listing && open) {
            const formData = transformListingToFormData(listing)
            const coords = validateCoordinates(formData.latitude, formData.longitude)

            reset({
                ...formData,
                latitude: coords.lat,
                longitude: coords.lng,
            })

            // Set preview URLs for existing images
            if (formData.media && formData.media.length > 0) {
                setPreviewUrls(formData.media as string[])
            }
        } else if (!listing && open) {
            // Reset to defaults for create mode
            reset({
                title: { ar: "", en: "" },
                description: { ar: "", en: "" },
                type: "",
                category_id: "",
                properties: [],
                features: [],
                governorate_id: "",
                city_id: "",
                latitude: validatedCoords.lat,
                longitude: validatedCoords.lng,
                media: [],
                cover_image_index: 0,
                price: 0,
                payment_frequency: "",
                insurance: 0,
                status: "draft",
                is_featured: false,
            })
            setPreviewUrls([])
        }
    }, [listing, open, reset])

    // Queries
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const response = await api.get("/admin/categories")
            if (response.isError) {
                throw new Error(response.message)
            }
            // Handle different response structures
            const data = response.data?.data || response.data || []
            if (Array.isArray(data)) {
                return data.filter((cat: Category) => !cat.parent_id)
            }
            return []
        },
        enabled: open,
        refetchOnWindowFocus: false,
    })

    const { data: governorates = [] } = useQuery({
        queryKey: ['admin-governorates'],
        queryFn: async () => {
            const response = await api.get("/admin/governorates")
            if (response.isError) {
                throw new Error(response.message)
            }
            // Handle different response structures
            return response.data?.data || response.data || []
        },
        enabled: open,
        refetchOnWindowFocus: false,
    })

    const selectedGovernorateId = watch("governorate_id")

    const { data: cities = [] } = useQuery({
        queryKey: ['admin-cities', selectedGovernorateId],
        queryFn: async () => {
            if (!selectedGovernorateId) return []
            const response = await api.get(`/admin/cities?governorate_id=${selectedGovernorateId}`)
            if (response.isError) {
                throw new Error(response.message)
            }
            // Handle different response structures
            return response.data?.data || response.data || []
        },
        enabled: open && !!selectedGovernorateId,
        refetchOnWindowFocus: false,
    })

    // Load category data when category_id changes
    useEffect(() => {
        const categoryId = watch("category_id")
        if (categoryId && categories.length > 0) {
            handleCategoryChange(categoryId.toString())
        }
    }, [watch("category_id"), categories])

    // Load location data when editing
    useEffect(() => {
        if (listing && listing.governorate_id) {
            setValue("governorate_id", listing.governorate_id.toString())
            if (listing.city_id) {
                setValue("city_id", listing.city_id.toString())
            }
            setIsLocationSelected(true)
        }
    }, [listing, setValue])

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: ListingFormData) => createListing(data),
        onSuccess: (data) => {
            console.info("✅ Listing created successfully:", data)
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            setShowSuccess(true)
            setIsLoading(false)
        },
        onError: (error: any) => {
            console.error("❌ Error creating listing:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "فشل إنشاء الإعلان"
            toast.error(errorMessage)
            setIsLoading(false)
        },
    })

    const updateMutation = useMutation({
        mutationFn: (data: ListingFormData) => {
            if (!listing?.id) throw new Error("Listing ID is required")
            return updateListing(listing.id, data)
        },
        onSuccess: (data) => {
            console.info("✅ Listing updated successfully:", data)
            queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            queryClient.invalidateQueries({ queryKey: ["listing", listing?.id] })
            setShowSuccess(true)
            setIsLoading(false)
        },
        onError: (error: any) => {
            console.error("❌ Error updating listing:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "فشل تحديث الإعلان"
            toast.error(errorMessage)
            setIsLoading(false)
        },
    })

    // Category handlers
    const handleCategoryChange = async (categoryId: string) => {
        const category = categories.find((cat: Category) => cat.id.toString() === categoryId)
        if (!category) return

        setSelectedCategory(category)
        setValue("category_id", categoryId)

        if (category.children && category.children.length > 0) {
            setSubCategories(category.children)
            setSelectedSubCategory(null)
            setSelectedSubSubCategory(null)

            if (category.properties) setAvailableProperties(category.properties)
            if (category.features) setAvailableFeatures(category.features)
        } else {
            try {
                const response = await api.get(`/admin/categories?parent_id=${categoryId}`)
                if (!response.isError && response.data) {
                    setSubCategories(response.data)
                    const catResponse = await api.get(`/admin/categories/${categoryId}`)
                    if (!catResponse.isError && catResponse.data) {
                        if (catResponse.data.properties) setAvailableProperties(catResponse.data.properties)
                        if (catResponse.data.features) setAvailableFeatures(catResponse.data.features)
                    }
                } else {
                    setSubCategories([])
                }
            } catch (error) {
                console.error("❌ Error loading sub categories:", error)
                setSubCategories([])
            }
            setSelectedSubCategory(null)
            setSelectedSubSubCategory(null)
        }
    }

    const handleSubCategoryChange = async (subCategoryId: string) => {
        const subCategory = subCategories.find((cat: Category) => cat.id.toString() === subCategoryId)
        if (!subCategory) return

        setSelectedSubCategory(subCategory)

        if (subCategory.properties && subCategory.properties.length > 0) {
            setAvailableProperties(subCategory.properties)
        } else {
            setAvailableProperties([])
        }

        if (subCategory.features && subCategory.features.length > 0) {
            setAvailableFeatures(subCategory.features)
        } else {
            setAvailableFeatures([])
        }

        if (subCategory.children && subCategory.children.length > 0) {
            setSubSubCategories(subCategory.children)
            setSelectedSubSubCategory(null)
        } else {
            try {
                const response = await api.get(`/admin/categories?parent_id=${subCategoryId}`)
                if (!response.isError && response.data) {
                    setSubSubCategories(response.data)
                } else {
                    setSubSubCategories([])
                }
            } catch (error) {
                console.error("❌ Error loading sub-sub categories:", error)
                setSubSubCategories([])
            }
            setSelectedSubSubCategory(null)
        }
    }

    const handleSubSubCategoryChange = async (subSubCategoryId: string) => {
        const subSubCategory = subSubCategories.find((cat: Category) => cat.id.toString() === subSubCategoryId)
        if (!subSubCategory) return

        setSelectedSubSubCategory(subSubCategory)

        if (subSubCategory.properties && subSubCategory.properties.length > 0) {
            setAvailableProperties(subSubCategory.properties)
        } else {
            try {
                const response = await api.get(`/admin/categories/${subSubCategoryId}/properties`)
                if (!response.isError && response.data) {
                    setAvailableProperties(response.data)
                } else {
                    setAvailableProperties([])
                }
            } catch (error) {
                console.error("❌ Error loading properties:", error)
                setAvailableProperties([])
            }
        }

        if (subSubCategory.features && subSubCategory.features.length > 0) {
            setAvailableFeatures(subSubCategory.features)
        } else {
            try {
                const response = await api.get(`/admin/categories/${subSubCategoryId}/features`)
                if (!response.isError && response.data) {
                    setAvailableFeatures(response.data)
                } else {
                    setAvailableFeatures([])
                }
            } catch (error) {
                console.error("❌ Error loading features:", error)
                setAvailableFeatures([])
            }
        }
    }


    // Handle location selection
    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setValue("latitude", lat)
        setValue("longitude", lng)
        setIsLocationSelected(true)
    }

    // Form submission
    const onSubmit = async (data: ListingFormData) => {
        console.info("🚀 Form submission started - Editing:", isEditing, "ID:", listing?.id)

        const isValid = await methods.trigger()
        console.info("🔍 Form validation result:", isValid)

        if (!isValid) {
            const validationErrors = methods.formState.errors
            console.error("❌ Form validation failed:", validationErrors)

            if (validationErrors.media) {
                toast.error(`خطأ في الصور: ${validationErrors.media.message || 'يجب رفع صورة واحدة على الأقل'}`)
            } else if (validationErrors.category_id) {
                toast.error("التصنيف مطلوب")
            } else if (validationErrors.governorate_id) {
                toast.error("المحافظة مطلوبة")
            } else {
                toast.error("يرجى تصحيح الأخطاء في النموذج")
            }
            return
        }

        setIsLoading(true)
        try {
            if (isEditing && listing?.id) {
                console.info("🔄 Updating existing listing...")
                await updateMutation.mutateAsync(data)
            } else {
                console.info("🆕 Creating new listing...")
                await createMutation.mutateAsync(data)
            }
        } catch (error: any) {
            console.error("❌ Form submission error:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء حفظ الإعلان"
            toast.error(errorMessage)
            setIsLoading(false)
        }
    }


    const Option = ({ className, classNameSub, text, onClick }: { className: string, classNameSub: any, text: string, onClick: () => void }) => {
        return (
            <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${className}`}
                onClick={onClick}
            >
                <div className="text-center flex flex-row gap-4 items-center justify-start">
                    <div className={`w-4 h-4 text-2xl rounded-full border-primary border-3 text-white p-2 ${classNameSub}`}> </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="font-semibold text-primary">{text}</div>
                    </div>
                </div>
            </div>
        )
    }

    const handleCreateAnother = () => {
        setShowSuccess(false)
        setIsLocationSelected(false)
        setPreviewUrls([])
        methods.reset()
        onOpenChange(false)
        setTimeout(() => {
            onOpenChange(true)
        }, 300)
    }

    const handleClose = () => {
        setShowSuccess(false)
        setIsLocationSelected(false)
        setPreviewUrls([])
        onOpenChange(false)
        queryClient.invalidateQueries({ queryKey: ["table-data", urlEndpoint] })
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {isEditing ? "تعديل الإعلان" : "إنشاء إعلان جديد"}
                        </DialogTitle>
                    </DialogHeader>

                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4">
                            {/* Basic Info Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b pb-2">البيانات الأساسية</h3>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title_ar" className="text-right block">
                                        العنوان <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title[ar]"
                                        {...methods.register("title.ar", { required: "العنوان بالعربية مطلوب" })}
                                        placeholder="اكتب عنواناً واضحاً بالعربية"
                                        className="text-right"
                                    />
                                    {errors.title?.ar && (
                                        <p className="text-xs text-destructive text-right">{errors.title.ar.message}</p>
                                    )}
                                    <Input
                                        id="title[en]"
                                        {...methods.register("title.en")}
                                        placeholder="Enter title in English"
                                        className="text-left"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description_ar" className="text-right block">
                                        الوصف
                                    </Label>
                                    <Textarea
                                        id="description[ar]"
                                        {...methods.register("description.ar")}
                                        placeholder="اكتب وصفاً مفصلاً للعقار"
                                        className="text-right"
                                        rows={3}
                                    />
                                    <Textarea
                                        id="description[en]"
                                        {...methods.register("description.en")}
                                        placeholder="Enter detailed description in English"
                                        className="text-left"
                                        rows={3}
                                    />
                                </div>

                                {/* Property Type */}
                                <div className="space-y-2">
                                    <Label className="text-right block text-lg font-semibold">
                                        نوع العقار <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Option
                                            className={watch("type") === "sale" ? "border-primary bg-primary/5" : "border-gray-200"}
                                            classNameSub={watch("type") === "sale" && "bg-primary"}
                                            text="للبيع"
                                            onClick={() => setValue("type", "sale")}
                                        />
                                        <Option
                                            className={watch("type") === "rent" ? "border-primary bg-primary/5" : "border-gray-200"}
                                            classNameSub={watch("type") === "rent" && "bg-primary"}
                                            text="للإيجار"
                                            onClick={() => setValue("type", "rent")}
                                        />
                                    </div>
                                    {errors.type && (
                                        <p className="text-xs text-destructive text-right">{errors.type.message}</p>
                                    )}
                                </div>

                                {/* Availability Status */}
                                <div className="space-y-2">
                                    <Label className="text-right block text-lg font-semibold">
                                        حالة التوفر <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="grid grid-cols-4 gap-3">
                                        <Option
                                            className={watch("availability_status") === "available" ? "border-primary bg-primary/5" : "border-gray-200"}
                                            classNameSub={watch("availability_status") === "available" && "bg-primary"}
                                            text="متاح"
                                            onClick={() => setValue("availability_status", "available")}
                                        />
                                        <Option
                                            className={watch("availability_status") === "unavailable" ? "border-primary bg-primary/5" : "border-gray-200"}
                                            classNameSub={watch("availability_status") === "unavailable" && "bg-primary"}
                                            text="غير متاح"
                                            onClick={() => setValue("availability_status", "unavailable")}
                                        />
                                        <Option
                                            className={watch("availability_status") === "rented" ? "border-primary bg-primary/5" : "border-gray-200"}
                                            classNameSub={watch("availability_status") === "rented" && "bg-primary"}
                                            text="مؤجر"
                                            onClick={() => setValue("availability_status", "rented")}
                                        />
                                        <Option
                                            className={watch("availability_status") === "solded" ? "border-primary bg-primary/5" : "border-gray-200"}
                                            classNameSub={watch("availability_status") === "solded" && "bg-primary"}
                                            text="مباع"
                                            onClick={() => setValue("availability_status", "solded")}
                                        />
                                    </div>
                                    {errors.availability_status && (
                                        <p className="text-xs text-destructive text-right">{errors.availability_status.message}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category_id" className="text-right block">
                                        التصنيف الرئيسي <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={watch("category_id") || ""}
                                        onValueChange={(value) => {
                                            setValue("category_id", value)
                                            handleCategoryChange(value)
                                        }}
                                    >
                                        <SelectTrigger id="category_id" className="text-right">
                                            <SelectValue placeholder="اختر التصنيف الرئيسي" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name.ar}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-xs text-destructive text-right">{errors.category_id.message}</p>
                                    )}
                                </div>

                                {/* Sub Category */}
                                {subCategories.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="sub_category" className="text-right block">
                                            التصنيف الفرعي
                                        </Label>
                                        <Select
                                            value={selectedSubCategory?.id.toString() || ""}
                                            onValueChange={(value) => handleSubCategoryChange(value)}
                                        >
                                            <SelectTrigger id="sub_category" className="text-right">
                                                <SelectValue placeholder="اختر التصنيف الفرعي" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name.ar}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Sub-Sub Category */}
                                {subSubCategories.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="sub_sub_category" className="text-right block">
                                            التصنيف الفرعي للفرعي
                                        </Label>
                                        <Select
                                            value={selectedSubSubCategory?.id.toString() || ""}
                                            onValueChange={(value) => handleSubSubCategoryChange(value)}
                                        >
                                            <SelectTrigger id="sub_sub_category" className="text-right">
                                                <SelectValue placeholder="اختر التصنيف الفرعي للفرعي" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subSubCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name.ar}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Properties */}
                                {availableProperties.length > 0 && (
                                    <div className="space-y-4">
                                        <Label className="text-right block text-lg font-semibold">
                                            خصائص العقار
                                        </Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {availableProperties.map((property) => (
                                                <div key={property.id} className="space-y-2">
                                                    <Label htmlFor={`property_${property.id}`} className="text-right block">
                                                        {property.name.ar}
                                                    </Label>
                                                    {(property.type === 'text' || property.type === 'string') && (
                                                        <Input
                                                            id={`property_${property.id}`}
                                                            value={watch("properties")?.find(p => p.id === property.id)?.value || ""}
                                                            onChange={(e) => {
                                                                const newProperties = [...(watch("properties") || [])]
                                                                const existingIndex = newProperties.findIndex(p => p.id === property.id)
                                                                if (existingIndex >= 0) {
                                                                    newProperties[existingIndex] = { ...newProperties[existingIndex], value: e.target.value }
                                                                } else {
                                                                    newProperties.push({ id: property.id, value: e.target.value })
                                                                }
                                                                setValue("properties", newProperties)
                                                            }}
                                                            placeholder={`أدخل ${property.name.ar}`}
                                                            className="text-right"
                                                        />
                                                    )}
                                                    {(property.type === 'number' || property.type === 'int' || property.type === 'float') && (
                                                        <Input
                                                            id={`property_${property.id}`}
                                                            type="number"
                                                            step={property.type === 'float' ? "any" : "1"}
                                                            value={watch("properties")?.find(p => p.id === property.id)?.value || ""}
                                                            onChange={(e) => {
                                                                const newProperties = [...(watch("properties") || [])]
                                                                const existingIndex = newProperties.findIndex(p => p.id === property.id)
                                                                if (existingIndex >= 0) {
                                                                    newProperties[existingIndex] = { ...newProperties[existingIndex], value: e.target.value }
                                                                } else {
                                                                    newProperties.push({ id: property.id, value: e.target.value })
                                                                }
                                                                setValue("properties", newProperties)
                                                            }}
                                                            placeholder={`أدخل ${property.name.ar}`}
                                                            className="text-right"
                                                        />
                                                    )}
                                                    {(property.type === 'select' || (property.options && property.options.length > 0)) && (
                                                        <Select
                                                            value={watch("properties")?.find(p => p.id === property.id)?.value || ""}
                                                            onValueChange={(value) => {
                                                                const newProperties = [...(watch("properties") || [])]
                                                                const existingIndex = newProperties.findIndex(p => p.id === property.id)
                                                                if (existingIndex >= 0) {
                                                                    newProperties[existingIndex] = { ...newProperties[existingIndex], value }
                                                                } else {
                                                                    newProperties.push({ id: property.id, value })
                                                                }
                                                                setValue("properties", newProperties)
                                                            }}
                                                        >
                                                            <SelectTrigger className="text-right">
                                                                <SelectValue placeholder={`اختر ${property.name.ar}`} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {property.options && property.options.length > 0 ? (
                                                                    property.options.map((option: any, index: number) => (
                                                                        <SelectItem key={index} value={option.ar}>
                                                                            {option.ar}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <>
                                                                        <SelectItem value="yes">نعم</SelectItem>
                                                                        <SelectItem value="no">لا</SelectItem>
                                                                    </>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Features */}
                                {availableFeatures.length > 0 && (
                                    <div className="space-y-4">
                                        <Label className="text-right block text-lg font-semibold">
                                            مميزات العقار
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {availableFeatures.map((feature) => (
                                                <div key={feature.id} className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
                                                    <Checkbox
                                                        id={`feature_${feature.id}`}
                                                        checked={watch("features")?.includes(feature.id.toString()) || false}
                                                        onCheckedChange={(checked) => {
                                                            const newFeatures = [...(watch("features") || [])]
                                                            if (checked) {
                                                                if (!newFeatures.includes(feature.id.toString())) {
                                                                    newFeatures.push(feature.id.toString())
                                                                }
                                                            } else {
                                                                const index = newFeatures.indexOf(feature.id.toString())
                                                                if (index > -1) {
                                                                    newFeatures.splice(index, 1)
                                                                }
                                                            }
                                                            setValue("features", newFeatures)
                                                        }}
                                                    />
                                                    <Label htmlFor={`feature_${feature.id}`} className="cursor-pointer text-sm flex-1">
                                                        {feature.name.ar}
                                                        {feature.description && (
                                                            <span className="block text-xs text-gray-500 mt-1">
                                                                {feature.description.ar}
                                                            </span>
                                                        )}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Location Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b pb-2">الموقع</h3>

                                {/* Governorate */}
                                <div className="space-y-2">
                                    <Label htmlFor="governorate_id" className="text-right block">
                                        المحافظة <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={watch("governorate_id") || ""}
                                        onValueChange={(value) => setValue("governorate_id", value)}
                                    >
                                        <SelectTrigger id="governorate_id" className="text-right">
                                            <SelectValue placeholder="اختر المحافظة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {governorates.map((governorate: Governorate) => (
                                                <SelectItem key={governorate.id} value={governorate.id.toString()}>
                                                    {governorate.name.ar}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.governorate_id && (
                                        <p className="text-xs text-destructive text-right">{errors.governorate_id.message}</p>
                                    )}
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <Label htmlFor="city_id" className="text-right block">
                                        المدينة (اختياري)
                                    </Label>
                                    <Select
                                        value={watch("city_id") || ""}
                                        onValueChange={(value) => setValue("city_id", value)}
                                        disabled={!watch("governorate_id")}
                                    >
                                        <SelectTrigger id="city_id" className="text-right">
                                            <SelectValue placeholder="اختر المدينة (اختياري)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city: City) => (
                                                <SelectItem key={city.id} value={city.id.toString()}>
                                                    {city.name.ar}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Map */}
                                <div className="space-y-4">
                                    <Label className="text-right block">
                                        الموقع على الخريطة <span className="text-destructive">*</span>
                                    </Label>
                                    <LocationPickerMap
                                        initialLat={watch("latitude") || 34.8021}
                                        initialLng={watch("longitude") || 36.7570}
                                        onLocationSelect={handleLocationSelect}
                                        onClose={() => { }}
                                        showControls={true}
                                    />
                                    {errors.latitude && (
                                        <p className="text-xs text-destructive text-right">{errors.latitude.message}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Images Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b pb-2">الصور</h3>
                                <ImagesStep
                                    onNext={() => { }}
                                    onPrevious={() => { }}
                                    showNavigation={false}
                                    previewUrls={previewUrls}
                                    setPreviewUrls={setPreviewUrls}
                                />
                            </div>

                            <Separator />

                            {/* Price Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b pb-2">السعر</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-lg font-semibold text-right">
                                            السعر (بالدينار الأردني)
                                        </Label>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={watch("price") || ""}
                                            onChange={(e) => setValue("price", parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="text-right text-lg h-14 pl-8"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            $
                                        </div>
                                    </div>
                                    {errors.price && (
                                        <p className="text-xs text-destructive text-right">{errors.price.message}</p>
                                    )}
                                </div>

                                {/* Payment Frequency - Only for Rent */}
                                {watch("type") === "rent" && (
                                    <div className="space-y-4">
                                        <Label className="text-lg font-semibold text-right block">
                                            دورية الدفع (للإيجار)
                                        </Label>

                                        <div className="space-y-3">
                                            {[
                                                { value: "monthly", label: "شهرياً" },
                                                { value: "quarterly", label: "كل 3 أشهر" },
                                                { value: "semi_annually", label: "كل 6 أشهر" },
                                                { value: "annually", label: "سنوياً" }
                                            ].map((option) => (
                                                <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                                                    <input
                                                        type="radio"
                                                        id={`payment_frequency_${option.value}`}
                                                        value={option.value}
                                                        checked={watch("payment_frequency") === option.value}
                                                        onChange={(e) => setValue("payment_frequency", e.target.value)}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                                    />
                                                    <Label
                                                        htmlFor={`payment_frequency_${option.value}`}
                                                        className="cursor-pointer text-sm flex-1"
                                                    >
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Insurance */}
                                <div className="space-y-2">
                                    <Label htmlFor="insurance" className="text-right block">
                                        التأمين (اختياري)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="insurance"
                                            type="number"
                                            step="0.01"
                                            value={watch("insurance") || ""}
                                            onChange={(e) => setValue("insurance", parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="text-right text-lg h-14 pl-8"
                                        />
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                            $
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Admin Settings */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold border-b pb-2">الإعدادات الإدارية</h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-right block text-lg font-semibold">
                                            حالة الإعلان
                                        </Label>
                                        <Select
                                            value={watch("status") || "draft"}
                                            onValueChange={(value) => setValue("status", value as any)}
                                        >
                                            <SelectTrigger className="text-right">
                                                <SelectValue placeholder="اختر الحالة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">مسودة</SelectItem>
                                                <SelectItem value="in_review">قيد المراجعة</SelectItem>
                                                <SelectItem value="approved">معتمد</SelectItem>
                                                <SelectItem value="rejected">مرفوض</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        <Checkbox
                                            id="is_featured"
                                            checked={watch("is_featured") || false}
                                            onCheckedChange={(checked) => setValue("is_featured", checked as boolean)}
                                        />
                                        <Label htmlFor="is_featured" className="cursor-pointer text-sm">
                                            إعلان مميز
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <DialogFooter className="gap-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                >
                                    إلغاء
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "جاري الحفظ..." : (isEditing ? "حفظ التعديلات" : "إنشاء الإعلان")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            <SuccessModal
                open={showSuccess}
                onClose={handleClose}
                onCreateAnother={handleCreateAnother}
                isEditing={isEditing}
            />
        </>
    )
}

