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
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"

// STEPS will be defined inside component to use translations

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
    const t = useTranslations('listingForm')
    const isEditMode = mode === "edit"

    // Define steps with translations
    const STEPS = [
        { id: 1, label: t('steps.basic'), key: "basic" },
        { id: 2, label: t('steps.location'), key: "location" },
        { id: 3, label: t('steps.images'), key: "images" },
        { id: 4, label: t('steps.price'), key: "price" },
    ]

    const [currentStep, setCurrentStep] = React.useState(1)
    const [showSuccess, setShowSuccess] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    // Scroll to top when step changes
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [currentStep])

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

    // Fetch listing data for editing
    const { data: listingData, isLoading: isLoadingListing } = useQuery({
        queryKey: ['user-listing', listingId],
        queryFn: async () => {
            if (!listingId) return null
            const response = await api.get(`/user/listings/${listingId}`)
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
            // Handle category hierarchy
            let categoryId = listing.category?.id?.toString() || ""
            let subCategoryId = (listing as any).sub_category_id?.toString() || ""
            let subSubCategoryId = (listing as any).sub_sub_category_id?.toString() || ""

            // Check if the category has a parent_id (it's a sub-category)
            if (listing.category?.parent_id) {
                categoryId = listing.category.parent_id.toString()
                subCategoryId = listing.category_id?.toString() || ""
                if ((listing as any).sub_category_id) {
                    subSubCategoryId = (listing as any).sub_category_id.toString()
                }
            } else if (listing.category_id) {
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
                governorate_id: listing.governorate?.id?.toString() || "",
                city_id: listing.city?.id?.toString() || "",
                latitude: listing.latitude ? parseFloat(listing.latitude.toString()) : validatedCoords.lat,
                longitude: listing.longitude ? parseFloat(listing.longitude.toString()) : validatedCoords.lng,
                // Preserve full media objects (especially iframely objects) when present.
                images: listing.media?.map((m: any) => {
                    if (!m) return m
                    // If it's an iframely object (or already an object with nested data) preserve it
                    if (typeof m === 'object') {
                        // If it's an object that contains iframely data, keep the whole object
                        if (m.iframely || m.source === 'iframely') return m
                        // If it's a plain media object with url fields, keep the whole object too
                        if (m.url || m.image_url || m.full_url) return m
                    }
                    // Fallback to string values
                    return typeof m === 'string' ? m : (m?.url || m?.image_url || m || '')
                }) || [],
                cover_image_index: (listing as any).cover_image_index || 0,
                price: listing.price || 0,
                pay_every: listing.pay_every ? String(listing.pay_every) : "",
                insurance: listing.insurance || 0,
                status: (() => {
                    // draft,in_review,approved,rejected
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

    // Initialize React Hook Form
    const methods = useForm<ListingFormData>({
        resolver: zodResolver(listingFormSchema),
        defaultValues: defaultValues as any,
        mode: "onChange"
    })

    const { watch, setValue, handleSubmit, trigger, reset } = methods

    // Track if form has been reset to prevent infinite loops
    const hasResetRef = React.useRef<string | null>(null)

    React.useEffect(() => {
        hasResetRef.current = null
    }, [listingId])

    // Load listing data side effects
    React.useEffect(() => {
        if (isEditMode && listing && !isLoadingListing) {
            const listingKey = `${listingId}-${listing.id}`

            if (hasResetRef.current !== listingKey) {
                // Ensure status and properties are normalized before reset
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

                        // iframely objects: prefer thumbnail if available
                        if (m.iframely) {
                            return m.iframely.links?.thumbnail?.[0]?.href || m.iframely.thumbnail_url || m.url || m.image_url || m.full_url || ""
                        }

                        // plain media object: prefer url fields
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
        queryKey: ['user-categories'],
        queryFn: async () => {
            const response = await api.get("/user/categories")
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
        queryKey: ['user-governorates'],
        queryFn: async () => {
            const response = await api.get("/user/governorates")
            if (response.isError) {
                throw new Error(response.message)
            }
            return response.data?.data || response.data || []
        },
        refetchOnWindowFocus: false,
    })

    const selectedGovernorateId = watch("governorate_id")

    const { data: cities = [] } = useQuery({
        queryKey: ['user-cities', selectedGovernorateId],
        queryFn: async () => {
            if (selectedGovernorateId) {
                const governorate = governorates.find((g: Governorate) => g.id.toString() === selectedGovernorateId)
                if (governorate && governorate.cities) {
                    return governorate.cities
                }
            }
            return []
        },
        enabled: !!selectedGovernorateId,
        refetchOnWindowFocus: false,
    })

    // Watch form values
    const formCategoryId = watch("category_id")
    const formSubCategoryId = watch("sub_category_id")
    const formSubSubCategoryId = watch("sub_sub_category_id")
    const formType = watch("type")

    // Clear pay_every when type is "sale" (not rent)
    React.useEffect(() => {
        if (formType === "sale") {
            setValue("pay_every", "")
        }
    }, [formType, setValue])

    // Load category hierarchy
    React.useEffect(() => {
        if (isEditMode && listing && !isLoadingListing && categories.length > 0) {
            const categoryIdToLoad = formCategoryId || ""
            const subCategoryIdToLoad = formSubCategoryId || ""
            const subSubCategoryIdToLoad = formSubSubCategoryId || ""

            if (categoryIdToLoad && categoryIdToLoad !== selectedCategory?.id?.toString()) {
                handleCategoryChange(categoryIdToLoad)
            }
            if (subCategoryIdToLoad && subCategoryIdToLoad !== selectedSubCategory?.id?.toString()) {
                setTimeout(() => {
                    handleSubCategoryChange(subCategoryIdToLoad)
                }, 300)
            }
            if (subSubCategoryIdToLoad && subSubCategoryIdToLoad !== selectedSubSubCategory?.id?.toString()) {
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
                const response = await api.get(`/user/categories?parent_id=${categoryId}`)
                if (!response.isError && response.data) {
                    setSubCategories(response.data)
                    const catResponse = await api.get(`/user/categories/${categoryId}`)
                    if (!catResponse.isError && catResponse.data) {
                        if (catResponse.data.properties) setAvailableProperties(catResponse.data.properties)
                        if (catResponse.data.features) setAvailableFeatures(catResponse.data.features)
                    }
                } else {
                    setSubCategories([])
                }
            } catch (error) {
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
                const response = await api.get(`/user/categories?parent_id=${subCategoryId}`)
                if (!response.isError && response.data) {
                    setSubSubCategories(response.data)
                } else {
                    setSubSubCategories([])
                }
            } catch (error) {
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
                const response = await api.get(`/user/categories/${subSubCategoryId}/properties`)
                if (!response.isError && response.data) {
                    setAvailableProperties(response.data)
                } else {
                    setAvailableProperties([])
                }
            } catch (error) {
                setAvailableProperties([])
            }
        }

        if (subSubCategory.features && subSubCategory.features.length > 0) {
            setAvailableFeatures(subSubCategory.features)
        } else {
            try {
                const response = await api.get(`/user/categories/${subSubCategoryId}/features`)
                if (!response.isError && response.data) {
                    setAvailableFeatures(response.data)
                } else {
                    setAvailableFeatures([])
                }
            } catch (error) {
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
        const stepFields: Record<number, any[]> = {
            1: ["title", "type", "availability_status", "category_id"],
            2: ["governorate_id", "latitude", "longitude"],
            3: ["images"],
            4: ["price"],
        }

        const fieldsToValidate = stepFields[currentStep] || []
        const isValid = await trigger(fieldsToValidate as any)

        if (!isValid) {
            toast.error(t('actions.completeRequiredFields'))
            return
        }

        if (currentStep < STEPS.length) {
            if (currentStep === 3) {
                setTimeout(() => {
                    setCurrentStep(currentStep + 1)
                }, 1000)
            } else {
                setCurrentStep(currentStep + 1)
            }
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // Transform form data to API format
    const transformFormDataToAPI = (formData: ListingFormData) => {
        // Get original listing data for edit mode to preserve English values
        const originalListing = isEditMode && listing ? listing : null

        // Transform title: send Arabic value, empty English for create, preserve old English for edit
        const transformedTitle = {
            ar: formData.title?.ar || "",
            en: isEditMode && originalListing?.title?.en !== null && originalListing?.title?.en !== undefined
                ? originalListing.title.en
                : "" // Empty string for create mode or if null/undefined in edit mode
        }

        // Transform description: send Arabic value, empty English for create, preserve old English for edit
        const transformedDescription = {
            ar: formData.description?.ar || "",
            en: isEditMode && originalListing?.description?.en !== null && originalListing?.description?.en !== undefined
                ? originalListing.description.en
                : "" // Empty string for create mode or if null/undefined in edit mode
        }

        // Transform properties: for string/text properties, send Arabic value, empty/preserve English
        const transformedProperties = formData.properties?.map((prop: any, index) => {
            // Find the original property value from listing
            const originalProperty = originalListing?.properties?.find(
                (p: any) => (p.property_id || p.id) === prop.id
            )

            // Check if this property is a string/text type (without options)
            const propertyDef = availableProperties.find(p => p.id === prop.id)
            const isStringType = propertyDef &&
                (propertyDef.type === 'text' || propertyDef.type === 'string') &&
                !propertyDef.options

            let value: any

            if (isStringType) {
                // For string/text properties: send Arabic, preserve/empty English
                // prop.value might be a string (from form input) or an object (from edit mode with preserved English)
                const arabicValue = typeof prop.value === 'object' && prop.value !== null && prop.value.ar !== undefined
                    ? prop.value.ar
                    : (typeof prop.value === 'string' ? prop.value : String(prop.value || ""))

                const englishValue = isEditMode && originalProperty?.value?.en
                    ? originalProperty.value.en
                    : (typeof prop.value === 'object' && prop.value !== null && prop.value.en !== undefined
                        ? prop.value.en
                        : "")

                value = {
                    ar: arabicValue,
                    en: englishValue
                }
            } else if (typeof prop.value === 'object' && prop.value !== null) {
                // For other types (select, bool, etc.), keep as is
                value = prop.value
            } else if (typeof prop.value === 'string') {
                // For non-string properties that are stored as string, convert to object
                value = {
                    ar: prop.value,
                    en: prop.value
                }
            } else {
                // For numbers and other types
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

        const images = formData.images || []

        if (images.length === 0) {
            throw new Error(t('validation.imagesRequired'))
        }


        const transformedImages = images
            .filter((image) => image !== null && image !== undefined)
            .map((image: any, index) => {
                if (image instanceof File) {
                    throw new Error(t('actions.uploadImagesFirst'))
                } else if (typeof image === 'string' && image.trim() !== '') {
                    // String URLs for regular images
                    return {
                        type: "image",
                        url: image.trim(),
                        source: "file",
                        sort_order: index + 1
                    }
                } else if (image && typeof image === 'object' && !Array.isArray(image)) {
                    // Handle iframely objects
                    if ((image.source === 'iframely' || image.iframely) && image.iframely) {
                        // Ensure iframely object has the required structure for Flutter
                        const iframelyData = image.iframely

                        // If thumbnail is nested inside iframely object, keep it there
                        // Otherwise, create a thumbnail object from links.thumbnail[0]
                        let thumbnailData = iframelyData.thumbnail

                        if (!thumbnailData && iframelyData.links?.thumbnail?.[0]) {
                            const thumb = iframelyData.links.thumbnail[0]
                            thumbnailData = {
                                href: thumb.href,
                                type: thumb.type,
                                content_length: thumb.content_length,
                                media: thumb.media
                            }
                        }

                        return {
                            type: image.type || (iframelyData.meta?.medium === 'video' ? 'video' : 'image'),
                            url: image.url || '',
                            source: "iframely",
                            iframely: {
                                url: iframelyData.url || image.url || '',
                                meta: iframelyData.meta || {},
                                thumbnail: thumbnailData,
                                links: iframelyData.links || {},
                                html: iframelyData.html || '',
                                rel: iframelyData.rel || [],
                                options: iframelyData.options || {}
                            },
                            sort_order: index + 1
                        }
                    }

                    // Regular object without iframely
                    return {
                        type: image.type || "image",
                        url: image.url || '',
                        source: image.source || "file",
                        sort_order: index + 1
                    }
                } else {
                    return null
                }
            })
            .filter((item): item is {
                type: string;
                url: string;
                source: string;
                sort_order: number;
                iframely?: any
            } => item !== null && item !== undefined && item.url !== undefined && item.url !== '')

        if (transformedImages.length === 0) {
            throw new Error(t('validation.imagesRequired'))
        }

        const { images: _, title: __, description: ___, ...restFormData } = formData

        // Ensure pay_every is a string (or undefined if empty)
        const normalizedPayEvery = (() => {
            const payEvery = restFormData.pay_every
            if (!payEvery) return undefined
            if (typeof payEvery === 'string') return payEvery || undefined
            if (typeof payEvery === 'number') return String(payEvery)
            return undefined
        })()

        return {
            ...restFormData,
            pay_every: normalizedPayEvery,
            title: transformedTitle,
            description: transformedDescription,
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
    const ensureIframelyForStrings = async (formData: ListingFormData): Promise<ListingFormData> => {
        const images = formData.images || []

        if (!Array.isArray(images)) {
            return formData
        }

        const supportedDomains = ['facebook.com', 'youtube.com', 'youtu.be', 'twitter.com', 'x.com', 'instagram.com', 'tiktok.com']

        const isSupported = (url: string) => {
            try {
                const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
                return supportedDomains.some(d => hostname === d || hostname.endsWith('.' + d))
            } catch (e) {
                return false
            }
        }

        const normalizedImages = await Promise.all(images.map(async (img: any) => {
            // If it's already an object with iframely data, keep it
            if (img && typeof img === 'object' && img.iframely) {
                return img
            }

            // If it's a string URL for supported domains, fetch iframely data
            if (typeof img === 'string' && img.trim() !== '' && isSupported(img)) {
                try {
                    const response = await api.post('/general/fetch-media', { url: img })
                    if (response.isError || !response.data) {
                        console.warn('Failed to fetch iframely for URL:', img)
                        return img // Return as string if fetch fails
                    }

                    const iframelyData = response.data?.data || response.data

                    // Validate iframely structure
                    if (!iframelyData?.meta || !iframelyData?.links?.thumbnail?.[0]) {
                        console.warn('Incomplete iframely data for URL:', img)
                        return img
                    }

                    const thumbCandidate = iframelyData.links.thumbnail[0]
                    const thumbnailUrl = thumbCandidate.href || iframelyData.thumbnail_url || img

                    return {
                        type: iframelyData.meta.medium === 'video' ? 'video' : 'image',
                        url: thumbnailUrl,
                        source: 'iframely',
                        iframely: {
                            url: img,
                            meta: iframelyData.meta || {},
                            thumbnail: {
                                href: thumbCandidate.href,
                                type: thumbCandidate.type,
                                content_length: thumbCandidate.content_length,
                                media: thumbCandidate.media,
                            },
                            links: iframelyData.links || {},
                            html: iframelyData.html || '',
                            rel: iframelyData.rel || [],
                            options: iframelyData.options || {}
                        }
                    }
                } catch (error) {
                    console.warn('Error fetching iframely data:', error)
                    return img // Return as string on error
                }
            }

            // Return other types as-is
            return img
        }))

        return {
            ...formData,
            images: normalizedImages
        }
    }
    // Create mutation
    const createMutation = useMutation({
        mutationFn: async (data: ListingFormData) => {
            // Already normalized in onSubmit
            const transformedData = transformFormDataToAPI(data)

            // Send to API
            const result = await api.post(`/user/listings`, transformedData)
            if (result.isError) {
                throw new Error(result.message || "Failed to create listing")
            }
            return result
        },
        onSuccess: (data) => {

            queryClient.invalidateQueries({ queryKey: ["user-listings"] })
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            // setShowSuccess(true)
            // setIsLoading(false)
            // onSuccess?.()
        },
        onError: (error: any) => {
            let errorMessage = t('actions.createError')

            // Try to extract error message from various possible locations
            const responseData = error?.response?.data || error?.data || {}

            // First, try to get the main message
            if (responseData.message) {
                errorMessage = responseData.message
            } else if (error?.message) {
                errorMessage = error.message
            }

            // Then, try to get specific field errors
            if (responseData.errors && typeof responseData.errors === 'object') {
                const errors = responseData.errors
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

            console.error("❌ [CREATE ERROR] Listing creation failed:", error)
            toast.error(errorMessage)
            setIsLoading(false)
            // Stop the process - don't continue with success flow
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (data: ListingFormData) => {
            if (!listingId) throw new Error("Listing ID is required")

            const transformedData = transformFormDataToAPI(data)
            const result = await api.put(`/user/listings/${listingId}`, transformedData)
            return result
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user-listings"] })
            queryClient.invalidateQueries({ queryKey: ["listings"] })
            queryClient.invalidateQueries({ queryKey: ["user-listing", listingId] })
            setShowSuccess(true)
            setIsLoading(false)
            onSuccess?.()
        },
        onError: (error: any) => {
            let errorMessage = t('actions.updateError')

            // Try to extract error message from various possible locations
            const responseData = error?.response?.data || error?.data || {}

            // First, try to get the main message
            if (responseData.message) {
                errorMessage = responseData.message
            } else if (error?.message) {
                errorMessage = error.message
            }

            // Then, try to get specific field errors
            if (responseData.errors && typeof responseData.errors === 'object') {
                const errors = responseData.errors
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

            console.error("❌ [UPDATE ERROR] Listing update failed:", error)
            toast.error(errorMessage)
            setIsLoading(false)
            // Stop the process - don't continue with success flow
        },
    })

    // Form submission
    const onSubmit = async (data: ListingFormData) => {
        setIsLoading(true)

        try {
            // Ensure external URLs have proper iframely structure
            const normalizedData = await ensureIframelyForStrings(data)

            const isValid = await trigger()

            if (!isValid) {
                const validationErrors = methods.formState.errors
                console.error("❌ [VALIDATION ERRORS] Form validation failed:", validationErrors)
                toast.error(t('actions.formErrors'))
                setIsLoading(false)
                return
            }

            if (currentStep === 4) {
                if (isEditMode) {
                    await updateMutation.mutateAsync(normalizedData)
                } else {
                    await createMutation.mutateAsync(normalizedData)
                }
            }

            setIsLoading(false)
        } catch (error: any) {
            console.error("❌ [SUBMISSION ERROR] Form submission error:", error)
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setShowSuccess(false)
        if (isEditMode && listingId) {
            // @
            // router.push(`/my-listings/${listingId}`)
        } else {
            // @
            // router.push("/my-listings")
        }
    }

    const handleCreateAnother = () => {
        setShowSuccess(false)
        setIsLocationSelected(false)
        setPreviewUrls([])
        setCurrentStep(1)
        methods.reset()
        router.push("/my-listings/create")
    }

    const handleEditAnother = () => {
        setShowSuccess(false)
        router.push("/my-listings")
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
                        <p className="text-gray-600 mb-4">
                            {t('form.listingNotFound')}
                        </p>
                        <Button onClick={() => router.push("/my-listings")}>
                            {t('navigation.backToList')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <Card className="w-full my-4">
                    <CardHeader className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <CardTitle className="text-lg sm:text-xl mb-3 sm:mb-4">
                            {isEditMode
                                ? t('form.editListingForm')
                                : t('form.createListingForm')
                            }
                        </CardTitle>
                        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                            <StepIndicator steps={STEPS} currentStep={currentStep} />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 my-4">
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
                                            {t('navigation.previous')}
                                        </Button>
                                    )}
                                    {currentStep === 4 ? (
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl order-1 sm:order-2"
                                        >
                                            {isLoading
                                                ? t('actions.saving')
                                                : isEditMode
                                                    ? t('actions.save')
                                                    : t('actions.create')
                                            }
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl order-1 sm:order-2"
                                        >
                                            {t('navigation.next')}
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

