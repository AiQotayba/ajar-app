"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { listingFormSchema, type ListingFormData, type Category, type Governorate, type City } from "./types"
import { StepIndicator } from "./components/step-indicator"
import { BasicInfoStep } from "./steps/basic-info-step"
import { LocationStep } from "./steps/location-step"
import { ImagesStep } from "./steps/images-step"
import { PriceStep } from "./steps/price-step"
import { SuccessModal } from "./components/success-modal"
import type { Listing } from "@/lib/types/listing"
import { Skeleton } from "@/components/ui/skeleton"

const STEPS = [
    { id: 1, label: "البيانات الأساسية", key: "basic" },
    { id: 2, label: "الموقع", key: "location" },
    { id: 3, label: "الصور", key: "images" },
    { id: 4, label: "السعر", key: "price" },
    { id: 5, label: "التقييم", key: "review" },
]

interface ListingFormProps {
    listingId?: number | null
    mode: "create" | "edit"
    onSuccess?: () => void
    onCancel?: () => void
}

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

export function ListingForm({ listingId, mode, onSuccess, onCancel }: ListingFormProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const isEditMode = mode === "edit"

    const [currentStep, setCurrentStep] = React.useState(1)
    const [showSuccess, setShowSuccess] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    // Form state
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)
    const [selectedSubCategory, setSelectedSubCategory] = React.useState<Category | null>(null)
    const [selectedSubSubCategory, setSelectedSubSubCategory] = React.useState<Category | null>(null)
    const [subCategories, setSubCategories] = React.useState<Category[]>([])
    const [subSubCategories, setSubSubCategories] = React.useState<Category[]>([])
    const [availableProperties, setAvailableProperties] = React.useState<any[]>([])
    const [availableFeatures, setAvailableFeatures] = React.useState<any[]>([])
    const [isLocationSelected, setIsLocationSelected] = React.useState(false)
    const [previewUrls, setPreviewUrls] = React.useState<string[]>([])

    const validatedCoords = validateCoordinates(34.8021, 36.7570)

    // Fetch listing data for editing (must be before useMemo)
    const { data: listingData, isLoading: isLoadingListing } = useQuery({
        queryKey: ['admin-listing', listingId],
        queryFn: async () => {
            if (!listingId) return null
            const response = await api.get(`/admin/listings/${listingId}`)
            if (response.isError) {
                throw new Error(response.message)
            }
            return response.data?.data || response.data
        },
        enabled: isEditMode && !!listingId,
        refetchOnWindowFocus: false,
    })

    const listing = listingData as any

    // Compute default values based on listing data (for edit mode)
    const defaultValues = React.useMemo(() => {
        if (isEditMode && listing && !isLoadingListing) {
            // Handle category hierarchy: if category has parent_id, set category_id to parent_id
            let categoryId = listing.category.id?.toString() || ""
            let subCategoryId = (listing as any).sub_category_id?.toString() || ""
            let subSubCategoryId = (listing as any).sub_sub_category_id?.toString() || ""

            // Check if the category has a parent_id (it's a sub-category)
            if (listing.category?.parent_id) {
                // Category is a sub-category, so:
                // - category_id should be the parent_id
                // - sub_category_id should be the current category_id
                categoryId = listing.category.parent_id.toString()
                subCategoryId = listing.category_id?.toString() || ""

                // If there was already a sub_category_id, it becomes sub_sub_category_id
                if ((listing as any).sub_category_id) {
                    subSubCategoryId = (listing as any).sub_category_id.toString()
                }
            } else if (listing.category_id) {
                // Category is a main category (no parent_id)
                categoryId = listing.category_id.toString()
                subCategoryId = (listing as any).sub_category_id?.toString() || ""
                subSubCategoryId = (listing as any).sub_sub_category_id?.toString() || ""
            }

            return {
                title: {
                    ar: listing.title?.ar || "",
                    en: listing.title?.en ?? "" // Convert null to empty string, preserve existing value
                },
                description: {
                    ar: listing.description?.ar || "",
                    en: listing.description?.en ?? "" // Convert null to empty string, preserve existing value
                },
                type: listing.type || "",
                availability_status: listing.availability_status || "available",
                category_id: categoryId,
                sub_category_id: subCategoryId,
                sub_sub_category_id: subSubCategoryId,
                properties: listing.properties?.map((prop: any) => {
                    let value: string = ""
                    if (typeof prop.value === 'object' && prop.value !== null) {
                        value = prop.value?.ar || prop.value?.en || ""
                    } else if (prop.value !== null && prop.value !== undefined) {
                        // Convert to string if it's a number or other type
                        value = String(prop.value)
                    }
                    return {
                        id: prop.property_id || prop.id,
                        value: value
                    }
                }).filter((prop: any) => prop.id) || [],
                features: listing.features?.map((f: any) => f.id?.toString() || f.toString()) || [],
                governorate_id: listing.governorate.id?.toString() || "",
                city_id: listing.city?.id?.toString() || "",
                latitude: listing.latitude ? parseFloat(listing.latitude.toString()) : validatedCoords.lat,
                longitude: listing.longitude ? parseFloat(listing.longitude.toString()) : validatedCoords.lng,
                images: listing.media?.map((m: any) => m.url || m.image_url || m) || [],
                cover_image_index: (listing as any).cover_image_index || 0,
                price: listing.price || 0,
                pay_every: listing.pay_every ? String(listing.pay_every) : "",
                insurance: listing.insurance || 0,
                status: (() => {
                    const validStatuses = ["draft", "in_review", "approved", "rejected"]
                    const listingStatus = listing.status || "draft"
                    // Return the status if it's valid, otherwise default to "draft"
                    return validStatuses.includes(listingStatus) ? listingStatus : "draft"
                })(),
                is_featured: listing.is_featured || false,
            }
        }

        // Default values for create mode
        return {
            title: { ar: "", en: "" },
            description: { ar: "", en: "" },
            type: "",
            category_id: "",
            sub_category_id: "",
            sub_sub_category_id: "",
            properties: [],
            features: [],
            governorate_id: "",
            city_id: "",
            latitude: validatedCoords.lat,
            longitude: validatedCoords.lng,
            images: [],
            cover_image_index: 0,
            price: 0,
            pay_every: "",
            insurance: 0,
            status: "draft",
            is_featured: false,
        }
    }, [isEditMode, listing, isLoadingListing, validatedCoords])

    // Initialize React Hook Form with dynamic default values
    const methods = useForm<ListingFormData>({
        resolver: zodResolver(listingFormSchema),
        defaultValues: defaultValues as any,
        mode: "onChange"
    })

    const { watch, setValue, handleSubmit, trigger, reset } = methods

    // Track if form has been reset to prevent infinite loops
    const hasResetRef = React.useRef<string | null>(null)

    // Reset the ref when listingId changes
    React.useEffect(() => {
        hasResetRef.current = null
    }, [listingId])

    // Load listing data side effects (preview URLs, location state) and reset form
    React.useEffect(() => {
        if (isEditMode && listing && !isLoadingListing) {
            const listingKey = `${listingId}-${listing.id}`
            
            // Only reset if we haven't reset for this specific listing
            if (hasResetRef.current !== listingKey) {

                // Ensure status, properties, title, description, and pay_every are normalized before reset
                const normalizedValues = {
                    ...defaultValues,
                    title: {
                        ar: defaultValues.title?.ar || "",
                        en: defaultValues.title?.en ?? "" // Convert null to empty string
                    },
                    description: {
                        ar: defaultValues.description?.ar || "",
                        en: defaultValues.description?.en ?? "" // Convert null to empty string
                    },
                    status: (() => {
                        const validStatuses = ["draft", "in_review", "approved", "rejected"]
                        const listingStatus = listing.status || "draft"
                        // Return the status if it's valid, otherwise default to "draft"
                        return validStatuses.includes(listingStatus) ? listingStatus : "draft"
                    })(),
                    pay_every: (() => {
                        const payEvery = defaultValues.pay_every
                        if (!payEvery) return ""
                        if (typeof payEvery === 'string') return payEvery
                        if (typeof payEvery === 'number') return String(payEvery)
                        return ""
                    })(),
                    properties: (defaultValues.properties || []).map((prop: any) => ({
                        id: prop.id,
                        value: typeof prop.value === 'string' ? prop.value : String(prop.value || "")
                    }))
                }

                // Reset form with normalized values
                // This ensures Select components get the correct values
                reset(normalizedValues as any, {
                    keepDefaultValues: false,
                    keepValues: false,
                    keepDirty: false,
                })
                hasResetRef.current = listingKey

                // Set preview URLs for images
                if (listing.media && listing.media.length > 0) {
                    const urls = listing.media.map((m: any) => {
                        if (typeof m === 'string') return m
                        return m.url || m.image_url || m.full_url || ""
                    }).filter(Boolean)
                    setPreviewUrls(urls)
                }

                setIsLocationSelected(!!listing.latitude && !!listing.longitude)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, listing, isLoadingListing, reset, listingId])

    // Queries
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const response = await api.get("/admin/categories")
            if (response.isError) {
                throw new Error(response.message)
            }
            const data = response.data?.data || response.data || []
            if (Array.isArray(data)) {
                return data.filter((cat: Category) => !cat.parent_id)
            }
            return []
        },
        refetchOnWindowFocus: false,
    })

    const { data: governorates = [] } = useQuery({
        queryKey: ['admin-governorates'],
        queryFn: async () => {
            const response = await api.get("/admin/governorates")
            if (response.isError) {
                throw new Error(response.message)
            }
            return response.data?.data || response.data || []
        },
        refetchOnWindowFocus: false,
    })

    const selectedGovernorateId = watch("governorate_id")

    const { data: cities = [] } = useQuery({
        queryKey: ['admin-cities', selectedGovernorateId],
        queryFn: async () => {
            if (selectedGovernorateId) {
                const response = await api.get(`/admin/cities?governorate_id=${selectedGovernorateId}`)
                if (response.isError) {
                    throw new Error(response.message)
                }
                return response.data?.data || response.data || []
            }
            return []
        },
        enabled: !!selectedGovernorateId,
        refetchOnWindowFocus: false,
    })

    // Watch form values to get the correct category hierarchy
    const formCategoryId = watch("category_id")
    const formSubCategoryId = watch("sub_category_id")
    const formSubSubCategoryId = watch("sub_sub_category_id")

    // Load category hierarchy after categories are loaded and listing data is available
    React.useEffect(() => {
        if (isEditMode && listing && !isLoadingListing && categories.length > 0) {
            // Get category values from form (they should already be set via defaultValues)
            const categoryIdToLoad = formCategoryId || ""
            const subCategoryIdToLoad = formSubCategoryId || ""
            const subSubCategoryIdToLoad = formSubSubCategoryId || ""

            // Load category hierarchy only if not already loaded
            if (categoryIdToLoad && categoryIdToLoad !== selectedCategory?.id?.toString()) {
                handleCategoryChange(categoryIdToLoad)
            }
            if (subCategoryIdToLoad && subCategoryIdToLoad !== selectedSubCategory?.id?.toString()) {
                // Wait a bit for subCategories to load
                setTimeout(() => {
                    handleSubCategoryChange(subCategoryIdToLoad)
                }, 300)
            }
            if (subSubCategoryIdToLoad && subSubCategoryIdToLoad !== selectedSubSubCategory?.id?.toString()) {
                // Wait a bit for subSubCategories to load
                setTimeout(() => {
                    handleSubSubCategoryChange(subSubCategoryIdToLoad)
                }, 500)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, listing, isLoadingListing, categories, formCategoryId, formSubCategoryId, formSubSubCategoryId])

    // Category handlers
    const handleCategoryChange = async (categoryId: string) => {
        const category = categories.find((cat: Category) => cat.id.toString() === categoryId)
        if (!category) return

        setSelectedCategory(category)
        setValue("category_id", categoryId)
        setSelectedSubCategory(null)
        setSelectedSubSubCategory(null)
        setValue("sub_category_id", "")
        setValue("sub_sub_category_id", "")

        if (category.children && category.children.length > 0) {
            setSubCategories(category.children)
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
        }
    }

    const handleSubCategoryChange = async (subCategoryId: string) => {
        const subCategory = subCategories.find((cat: Category) => cat.id.toString() === subCategoryId)
        if (!subCategory) return

        setSelectedSubCategory(subCategory)
        setValue("sub_category_id", subCategoryId)
        setSelectedSubSubCategory(null)
        setValue("sub_sub_category_id", "")

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
        }
    }

    const handleSubSubCategoryChange = async (subSubCategoryId: string) => {
        const subSubCategory = subSubCategories.find((cat: Category) => cat.id.toString() === subSubCategoryId)
        if (!subSubCategory) return

        setSelectedSubSubCategory(subSubCategory)
        setValue("sub_sub_category_id", subSubCategoryId)

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

    // Step navigation
    const handleNext = async () => {
        // Validate current step fields
        const stepFields: Record<number, any[]> = {
            1: ["title", "type", "availability_status", "category_id"],
            2: ["governorate_id", "latitude", "longitude"],
            3: ["images"],
            4: ["price"],
            5: ["review"],
        }

        const fieldsToValidate = stepFields[currentStep] || []
        const isValid = await trigger(fieldsToValidate as any)

        if (!isValid) {
            toast.error("يرجى إكمال جميع الحقول المطلوبة")
            return
        }

        if (currentStep < STEPS.length) {
            if (currentStep == 3) setTimeout(() => {
                setCurrentStep(currentStep + 1)
            }, 1000)
            else setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // Transform form data to API format
    const transformFormDataToAPI = (formData: ListingFormData) => {
        // Transform properties from {id, value} to {property_id, value, sort_order}
        const transformedProperties = formData.properties?.map((prop, index) => {
            let value: any
            if (typeof prop.value === 'object' && prop.value !== null) {
                value = prop.value
            } else if (typeof prop.value === 'string') {
                value = {
                    ar: prop.value,
                    en: prop.value
                }
            } else {
                value = {
                    ar: String(prop.value || ""),
                    en: String(prop.value || "")
                }
            }

            return {
                property_id: prop.id,
                value: value,
                sort_order: index + 1
            }
        }) || []

        // Transform images to media format
        const images = formData.images || []

        if (images.length === 0) {
            console.error("❌ [TRANSFORM] No images found in form data")
            throw new Error("يجب رفع صورة واحدة على الأقل")
        }

        const transformedImages = images
            .filter((image) => image !== null && image !== undefined)
            .map((image, index) => {
                if (image instanceof File) {
                    console.warn("⚠️ [TRANSFORM] Found File object in images")
                    throw new Error("يجب رفع الصور أولاً قبل الإرسال")
                } else if (typeof image === 'string' && image.trim() !== '') {
                    return {
                        type: "image",
                        url: image.trim(),
                        source: "file",
                        sort_order: index + 1
                    }
                } else if (image && typeof image === 'object' && !Array.isArray(image)) {
                    const imageObj = image as { type?: string; url?: string; source?: string; sort_order?: number }
                    return {
                        type: imageObj.type || "image",
                        url: imageObj.url || '',
                        source: imageObj.source || "file",
                        sort_order: imageObj.sort_order || index + 1
                    }
                } else {
                    console.warn(`⚠️ [TRANSFORM] Invalid image format at index ${index}:`, image)
                    return null
                }
            })
            .filter((item): item is { type: string; url: string; source: string; sort_order: number } =>
                item !== null && item !== undefined && item.url !== undefined && item.url !== ''
            )

        if (transformedImages.length === 0) {
            console.error("❌ [TRANSFORM] No valid images after transformation")
            throw new Error("يجب رفع صورة واحدة على الأقل")
        }

        // Destructure to remove images and add media
        const { images: _, ...restFormData } = formData

        // Ensure pay_every is a string (or undefined if empty)
        const normalizedPayEvery = (() => {
            const payEvery = restFormData.pay_every
            if (!payEvery) return undefined
            if (typeof payEvery === 'string') return payEvery || undefined
            if (typeof payEvery === 'number') return String(payEvery)
            return undefined
        })()

        // Ensure title and description en are not null
        const normalizedTitle = {
            ar: formData.title?.ar || "",
            en: formData.title?.en ?? "" // Convert null to empty string
        }

        const normalizedDescription = {
            ar: formData.description?.ar || "",
            en: formData.description?.en ?? "" // Convert null to empty string
        }

        return {
            ...restFormData,
            title: normalizedTitle,
            description: normalizedDescription,
            pay_every: normalizedPayEvery,
            properties: transformedProperties,
            media: transformedImages,
            category_id: formData.category_id ? Number(formData.category_id) : undefined,
            sub_category_id: formData.sub_category_id ? Number(formData.sub_category_id) : undefined,
            sub_sub_category_id: formData.sub_sub_category_id ? Number(formData.sub_sub_category_id) : undefined,
            governorate_id: formData.governorate_id ? Number(formData.governorate_id) : undefined,
            city_id: formData.city_id ? Number(formData.city_id) : undefined,
            latitude: formData.latitude?.toString() || "",
            longitude: formData.longitude?.toString() || "",
        }
    }

    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: ListingFormData) => {
            const transformedData = transformFormDataToAPI(data)
            const result = await api.post(`/admin/listings`, transformedData)
            return result
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["table-data", "/admin/listings"] })
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            queryClient.invalidateQueries({ queryKey: ["admin-listings"] })
            queryClient.refetchQueries({ queryKey: ["table-data", "/admin/listings"] })

            setShowSuccess(true)
            setIsLoading(false)
            onSuccess?.()
        },
        onError: (error: any) => {
            let errorMessage = "فشل إنشاء الإعلان"
            if (error?.data?.message) {
                errorMessage = error.data.message
            } else if (error?.message) {
                errorMessage = error.message
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message
            }

            if (error?.data?.errors) {
                const errors = error.data.errors
                const errorKeys = Object.keys(errors)
                if (errorKeys.length > 0) {
                    const firstError = errors[errorKeys[0]]
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = firstError[0]
                    } else if (typeof firstError === 'string') {
                        errorMessage = firstError
                    }
                }
            } else if (error?.errors) {
                const errors = error.errors
                const errorKeys = Object.keys(errors)
                if (errorKeys.length > 0) {
                    const firstError = errors[errorKeys[0]]
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = firstError[0]
                    } else if (typeof firstError === 'string') {
                        errorMessage = firstError
                    }
                }
            }

            toast.error(errorMessage)
            setIsLoading(false)
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (data: ListingFormData) => {
            if (!listingId) throw new Error("Listing ID is required")

            const transformedData = transformFormDataToAPI(data)
            const result = await api.put(`/admin/listings/${listingId}`, transformedData)
            return result
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["table-data", "/admin/listings"] })
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            queryClient.invalidateQueries({ queryKey: ["admin-listings"] })
            queryClient.invalidateQueries({ queryKey: ["admin-listing", listingId] })
            queryClient.refetchQueries({ queryKey: ["table-data", "/admin/listings"] })

            setShowSuccess(true)
            setIsLoading(false)
            onSuccess?.()
        },
        onError: (error: any) => {
            let errorMessage = "فشل تحديث الإعلان"
            if (error?.data?.message) {
                errorMessage = error.data.message
            } else if (error?.message) {
                errorMessage = error.message
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message
            }

            if (error?.data?.errors) {
                const errors = error.data.errors
                const errorKeys = Object.keys(errors)
                if (errorKeys.length > 0) {
                    const firstError = errors[errorKeys[0]]
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = firstError[0]
                    } else if (typeof firstError === 'string') {
                        errorMessage = firstError
                    }
                }
            } else if (error?.errors) {
                const errors = error.errors
                const errorKeys = Object.keys(errors)
                if (errorKeys.length > 0) {
                    const firstError = errors[errorKeys[0]]
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = firstError[0]
                    } else if (typeof firstError === 'string') {
                        errorMessage = firstError
                    }
                }
            }

            toast.error(errorMessage)
            setIsLoading(false)
        },
    })

    // Form submission
    const onSubmit = async (data: ListingFormData) => {
        const isValid = await trigger()
        setIsLoading(false)

        if (!isValid) {
            const validationErrors = methods.formState.errors
            console.error("❌ [VALIDATION ERRORS] Form validation failed:", validationErrors)
            toast.error("يرجى تصحيح الأخطاء في النموذج")
            return
        }

        setIsLoading(true)
        try {
            if (currentStep == 4) {
                if (isEditMode) {
                    return await updateMutation.mutateAsync(data)
                } else {
                    return await createMutation.mutateAsync(data)
                }
            }

            setIsLoading(false)
        } catch (error: any) {
            console.error("❌ [SUBMISSION ERROR] Form submission error:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء حفظ الإعلان"
            toast.error(errorMessage)
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setShowSuccess(false)
        if (isEditMode && listingId) {
            router.push(`/listings/${listingId}`)
        } else {
            router.push("/listings")
        }
    }

    const handleCreateAnother = () => {
        setShowSuccess(false)
        setIsLocationSelected(false)
        setPreviewUrls([])
        setCurrentStep(1)
        methods.reset()
        router.push("/listings/create")
    }

    const handleEditAnother = () => {
        setShowSuccess(false)
        router.push("/listings")
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInfoStep
                        key={`basic-info-${listingId || 'create'}-${formCategoryId || 'no-category'}`}
                        onNext={handleNext}
                        categories={categories}
                        subCategories={subCategories}
                        subSubCategories={subSubCategories}
                        selectedCategory={selectedCategory}
                        selectedSubCategory={selectedSubCategory}
                        selectedSubSubCategory={selectedSubSubCategory}
                        availableProperties={availableProperties}
                        availableFeatures={availableFeatures}
                        onCategoryChange={handleCategoryChange}
                        onSubCategoryChange={handleSubCategoryChange}
                        onSubSubCategoryChange={handleSubSubCategoryChange}
                        showNavigation={false}
                    />
                )
            case 2:
                return (
                    <LocationStep
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        governorates={governorates}
                        cities={cities}
                        onLocationSelect={handleLocationSelect}
                        isLocationSelected={isLocationSelected}
                        showNavigation={false}
                    />
                )
            case 3:
                return (
                    <ImagesStep
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        showNavigation={false}
                        previewUrls={previewUrls}
                        setPreviewUrls={setPreviewUrls}
                        mode={isEditMode ? "update" : "create"}
                    />
                )
            case 4:
                return (
                    <PriceStep
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        showNavigation={false}
                    />
                )
            default:
                return null
        }
    }

    // Loading state for edit mode
    if (isEditMode && isLoadingListing) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="w-full">
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Error state for edit mode
    if (isEditMode && !listing && !isLoadingListing) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="w-full">
                    <CardContent className="py-12 text-center">
                        <p className="text-gray-600 mb-4">لم يتم العثور على الإعلان المطلوب</p>
                        <Button onClick={() => router.push("/listings")}>
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <Card className="w-full">
                    <CardHeader className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <CardTitle className="text-lg sm:text-xl mb-3 sm:mb-4">
                            {isEditMode ? "نموذج تعديل الإعلان" : "نموذج إنشاء الإعلان"}
                        </CardTitle>
                        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                            <StepIndicator steps={STEPS} currentStep={currentStep} />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        <FormProvider {...methods}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                                <div className="min-h-[400px] sm:min-h-[500px]">
                                    {renderStep()}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t sticky bottom-0 bg-background pb-2 sm:pb-0">
                                    {currentStep > 1 && (
                                        <Button
                                            type="button"
                                            onClick={handlePrevious}
                                            variant="outline"
                                            className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl order-2 sm:order-1"
                                        >
                                            السابق
                                        </Button>
                                    )}
                                    {currentStep == 4 ? (
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl order-1 sm:order-2"
                                        >
                                            {isLoading
                                                ? "جاري الحفظ..."
                                                : isEditMode
                                                    ? "حفظ التعديلات"
                                                    : "إنشاء الإعلان"
                                            }
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl order-1 sm:order-2"
                                        >
                                            التالي
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            </div>

            <SuccessModal
                open={showSuccess}
                onClose={handleClose}
                onCreateAnother={isEditMode ? handleEditAnother : handleCreateAnother}
                isEditing={isEditMode}
            />
        </>
    )
}

