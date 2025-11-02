"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { createListing, updateListing, transformFormDataToAPI } from "@/lib/api/listings"
import { listingFormSchema, type ListingFormData, type Category } from "./types"
import { StepIndicator, SuccessModal } from "./components"
import { BasicInfoStep } from "./steps/basic-info-step"
import { LocationStep } from "./steps/location-step"
import { ImagesStep } from "./steps/images-step"
import { PriceStep } from "./steps/price-step"

interface ListingFormProps {
  initialData?: Partial<ListingFormData>
  isEditing?: boolean
  listingId?: string | number
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

const STEPS = [
  { id: 1, label: "بيانات أساسية", key: "basic" },
  { id: 2, label: "الموقع", key: "location" },
  { id: 3, label: "الصور", key: "images" },
  { id: 4, label: "السعر", key: "price" },
  { id: 5, label: "المراجعة", key: "review" },
]

export function ListingForm({
  initialData,
  isEditing = false,
  listingId,
  onSuccess,
  onCancel
}: ListingFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(isEditing ? 5 : 1)
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

    // Convert to numbers and validate
    const numLat = typeof lat === 'number' ? lat : parseFloat(lat)
    const numLng = typeof lng === 'number' ? lng : parseFloat(lng)

    // Check if coordinates are valid numbers and within valid ranges
    const isValidLat = !isNaN(numLat) && numLat >= -90 && numLat <= 90
    const isValidLng = !isNaN(numLng) && numLng >= -180 && numLng <= 180

    return {
      lat: isValidLat ? numLat : defaultLat,
      lng: isValidLng ? numLng : defaultLng
    }
  }

  // Validate initial coordinates
  const validatedCoords = validateCoordinates(initialData?.latitude, initialData?.longitude)

  // Initialize React Hook Form
  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: {
        ar: initialData?.title?.ar || "",
        en: initialData?.title?.en || "",
      },
      description: {
        ar: initialData?.description?.ar || "",
        en: initialData?.description?.en || "",
      },
      type: initialData?.type || "",
      category_id: initialData?.category_id || "",
      properties: initialData?.properties || [],
      features: initialData?.features || [],
      governorate_id: initialData?.governorate_id || "",
      city_id: initialData?.city_id || "",
      latitude: validatedCoords.lat,
      longitude: validatedCoords.lng,
      media: initialData?.media || [],
      cover_image_index: initialData?.cover_image_index || 0,
      price: initialData?.price || 0,
      payment_frequency: initialData?.payment_frequency || "",
      insurance: initialData?.insurance || 0,
    },
    mode: "onChange"
  })

  const { watch, setValue, handleSubmit, formState: { errors } } = methods

  // Queries
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get("/user/categories")

      if (response.isError) {
        throw new Error(response.message)
      }

      if (response.data && Array.isArray(response.data)) {
        const mainCategories = response.data.filter((cat: Category) => !cat.parent_id)

        return mainCategories
      }

      return []
    },
    // ايقاف التحديث التلقائي
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { data: governorates = [] } = useQuery({
    queryKey: ['governorates'],
    queryFn: async () => {
      const response = await api.get("/user/governorates")
      if (response.isError) throw new Error(response.message)
      return response.data || []
    },
    // ايقاف التحديث التلقائي
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { data: cities = [] } = useQuery({
    queryKey: ['cities', watch("governorate_id")],
    queryFn: async () => {
      if (!watch("governorate_id")) return []
      const response = await api.get(`/user/cities?governorate_id=${watch("governorate_id")}`)
      if (response.isError) throw new Error(response.message)
      return response.data || []
    },
    enabled: !!watch("governorate_id"),
    // ايقاف التحديث التلقائي
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  // Mutations 

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      console.log("🚀 ===== CREATE MUTATION STARTED =====")
      console.log("🚀 Raw form data:", data)

      try {
        // Transform data using the dedicated function
        const transformedData = transformFormDataToAPI(data)
        console.log("🔄 Transformed data:", transformedData)

        // Call the API
        console.log("📡 Calling createListing API...")
        const result = await createListing(transformedData)
        console.log("✅ Create API response:", result)
        return result
      } catch (error) {
        console.error("❌ Create mutation error:", error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log("✅ Create mutation success:", data)
      toast.success("تم إنشاء الإعلان بنجاح")
      setShowSuccess(true)
      onSuccess?.(data)
      // Navigate to the created listing
      if (data?.id) {
        console.log("🧭 Navigating to listing:", data.id)
        router.push(`/my-listings/${data.id}`)
      }
    },
    onError: (error: any) => {
      console.error("❌ Create mutation error:", error)
      console.error("❌ Error details:", {
        message: error?.message,
        response: error?.response?.data,
        stack: error?.stack
      })
      const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء إنشاء الإعلان"
      toast.error(errorMessage)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      console.log("🔄 ===== UPDATE MUTATION STARTED =====")
      console.log("🔄 Listing ID:", listingId)
      console.log("🔄 Raw form data:", data)

      try {
        // Transform data using the dedicated function
        const transformedData = transformFormDataToAPI(data)
        console.log("🔄 Transformed data:", transformedData)

        // Call the API
        console.log("📡 Calling updateListing API...")
        const result = await updateListing(parseInt(listingId!.toString()), transformedData)
        console.log("✅ Update API response:", result)
        return result
      } catch (error) {
        console.error("❌ Update mutation error:", error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log("✅ Update mutation success:", data)
      toast.success("تم تحديث الإعلان بنجاح")
      setShowSuccess(true)
      onSuccess?.(data)
      // Navigate to the updated listing
      if (data?.id) {
        console.log("🧭 Navigating to updated listing:", data.id)
        router.push(`/my-listings/${data.id}`)
      }
    },
    onError: (error: any) => {
      console.error("❌ Update mutation error:", error)
      console.error("❌ Error details:", {
        message: error?.message,
        response: error?.response?.data,
        stack: error?.stack
      })
      const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء تحديث الإعلان"
      toast.error(errorMessage)
    },
  })

  // Load initial data for editing
  useEffect(() => {
    console.log("🔄 ===== LOADING EFFECT TRIGGERED =====")
    console.log("🔄 Is editing:", isEditing)
    console.log("🔄 Listing ID:", listingId)
    if (isEditing && listingId) {
      console.log("🔄 Starting to load listing data...")
      loadListingData()
    }
  }, [isEditing, listingId])

  const loadListingData = async () => {
    try {
      console.log("📡 ===== API CALL STARTED =====")
      console.log("📡 Calling API:", `/user/listings/${listingId}`)
      const response = await api.get(`/user/listings/${listingId}`)
      console.log("📡 API Response:", response)

      if (response.isError) {
        console.error("❌ API Error:", response.message)
        toast.error(response.message || "حدث خطأ أثناء تحميل بيانات الإعلان")
        return
      }

      if (response.data) {
        const listing = response.data
        console.log("📥 Loading listing data for ID:", listing.id)
        console.log("📥 Category ID:", listing.category_id, "Type:", typeof listing.category_id)
        console.log("📥 Governorate ID:", listing.governorate_id, "Type:", typeof listing.governorate_id)

        const formData = {
          ...listing,
          category_id: listing.category_id?.toString() || "",
          governorate_id: listing.governorate_id?.toString() || "",
          city_id: listing.city_id?.toString() || "",
          insurance: listing.insurance || 0, // Default to 0 if null/undefined
          // Ensure media is properly formatted
          media: listing.media?.map((media: any) => {
            if (typeof media === 'string') return media
            if (media && typeof media === 'object' && media.url) return media.url
            return media
          }) || []
        }

        console.log("📥 Setting form data...")
        methods.reset(formData)
        console.log("📥 Form data set successfully")

        // Load category hierarchy if needed
        if (listing.category_id) {
          console.log("📥 Loading category hierarchy for:", listing.category_id)
          setTimeout(() => {
            syncCategorySelection(listing.category_id.toString())
          }, 100)
        }

        // Sync governorate and city selection
        if (listing.governorate_id) {
          console.log("📥 Syncing governorate selection for:", listing.governorate_id)
          setTimeout(() => {
            syncLocationSelection(listing.governorate_id, listing.city_id)
          }, 200)
        }

        // Sync properties and features
        if (listing.properties || listing.features) {
          console.log("📥 Syncing properties and features...")
          setTimeout(() => {
            syncPropertiesAndFeatures(listing.properties, listing.features)
          }, 300)
        }

        // Final verification and error tracking
        setTimeout(() => {
          const finalValues = methods.getValues()
          console.log("📥 Final verification - Form values:", finalValues)
          
          // Track specific validation errors
          trackValidationErrors(finalValues, listing)
        }, 500)

        // Mark location as selected if coordinates exist
        if (listing.latitude && listing.longitude) {
          console.log("📥 Location coordinates found, marking as selected")
          setIsLocationSelected(true)
        }

        // Force form validation to check for errors
        setTimeout(async () => {
          const validationResult = await methods.trigger()
          console.log("📥 Validation result:", validationResult)
          
          if (!validationResult) {
            console.log("❌ Validation failed, errors:", methods.formState.errors)
          }
        }, 1000)

        // Load existing images for preview
        if (listing.media && listing.media.length > 0) {
          const imageUrls = listing.media.map((media: any) => {
            return media.full_url || media // Handle both object and string formats
          })
          setPreviewUrls(imageUrls)
        }

        console.log("📥 Loading completed")
      } else {
        console.log("📥 No location coordinates found")
      }
    } catch (error: any) {
      console.error("❌ Error loading listing data:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء تحميل بيانات الإعلان"
      toast.error(errorMessage)
    }

  // Track critical validation errors
  if (errors.category_id || errors.governorate_id) {
    console.log("❌ Critical validation errors detected:")
    if (errors.category_id) console.log("❌ Category error:", errors.category_id)
    if (errors.governorate_id) console.log("❌ Governorate error:", errors.governorate_id)
  }
  }
  // Sync category selection algorithm
  const syncCategorySelection = async (categoryId: string) => {
    console.log("🔄 Syncing category selection for ID:", categoryId)
    
    try {
      // Find and set the main category
      const mainCategory = categories.find((cat: Category) => cat.id.toString() === categoryId)
      if (mainCategory) {
        setSelectedCategory(mainCategory)
        setValue("category_id", categoryId)
        
        // Load sub-categories
        let subCats: Category[] = []
        if (mainCategory.children && mainCategory.children.length > 0) {
          subCats = mainCategory.children
        } else {
          const response = await api.get(`/user/categories?parent_id=${categoryId}`)
          if (!response.isError && response.data) {
            subCats = response.data
          }
        }
        setSubCategories(subCats)
        
        // Load properties and features
        if (mainCategory.properties && mainCategory.properties.length > 0) {
          setAvailableProperties(mainCategory.properties)
        }
        
        if (mainCategory.features && mainCategory.features.length > 0) {
          setAvailableFeatures(mainCategory.features)
        }
      } else {
        console.error("❌ Main category not found for ID:", categoryId)
      }
    } catch (error) {
      console.error("❌ Error syncing category selection:", error)
    }
  }


  // Sync location selection algorithm
  const syncLocationSelection = async (governorateId: any, cityId?: any) => {
    console.log("🔄 Syncing location for governorate:", governorateId, "city:", cityId)
    
    try {
      // Find and set the governorate
      const governorate = governorates.find((gov: any) => gov.id.toString() === governorateId?.toString())
      if (governorate) {
        setValue("governorate_id", governorateId.toString())
        
        // Load cities for this governorate
        try {
          const response = await api.get(`/user/cities?governorate_id=${governorateId}`)
          if (!response.isError && response.data) {
            // Find and set the city if provided
            if (cityId) {
              const city = response.data.find((city: any) => city.id.toString() === cityId.toString())
              if (city) {
                setValue("city_id", cityId.toString())
              } else {
                setValue("city_id", "")
              }
            }
          }
        } catch (error) {
          console.error("❌ Error loading cities:", error)
        }
      } else {
        console.error("❌ Governorate not found for ID:", governorateId)
      }
    } catch (error) {
      console.error("❌ Error syncing location selection:", error)
    }
  }

  // Sync properties and features algorithm
  const syncPropertiesAndFeatures = (properties: any[], features: any[]) => {
    console.log("🔄 Syncing properties and features...")
    
    try {
      // Sync properties
      if (properties && Array.isArray(properties)) {
        const transformedProperties = properties.map((prop: any) => ({
          id: prop.property_id || prop.id,
          value: prop.value || ""
        }))
        setValue("properties", transformedProperties)
      }
      
      // Sync features
      if (features && Array.isArray(features)) {
        const transformedFeatures = features.map((feature: any) => 
          feature.id?.toString() || feature.toString()
        )
        setValue("features", transformedFeatures)
      }
    } catch (error) {
      console.error("❌ Error syncing properties and features:", error)
    }
  }

  // Track and fix validation errors
  const trackValidationErrors = async (formValues: any, listingData: any) => {
    console.log("🔍 Tracking validation errors...")
    
    try {
      // Trigger validation to get current errors
      const validationResult = await methods.trigger()
      const errors = methods.formState.errors
      
      console.log("🔍 Validation result:", validationResult)
      
      // Track and fix category_id error
      if (errors.category_id) {
        console.log("❌ Category ID Error:", errors.category_id)
        console.log("🔍 Form category_id:", formValues.category_id, "Listing category_id:", listingData.category_id)
        
        if (!formValues.category_id && listingData.category_id) {
          console.log("🔧 Fixing category_id...")
          setValue("category_id", listingData.category_id.toString())
        }
      }
      
      // Track and fix governorate_id error
      if (errors.governorate_id) {
        console.log("❌ Governorate ID Error:", errors.governorate_id)
        console.log("🔍 Form governorate_id:", formValues.governorate_id, "Listing governorate_id:", listingData.governorate_id)
        
        if (!formValues.governorate_id && listingData.governorate_id) {
          console.log("🔧 Fixing governorate_id...")
          setValue("governorate_id", listingData.governorate_id.toString())
        }
      }
      
      // Re-validate after fixes
      setTimeout(async () => {
        const finalValidation = await methods.trigger()
        const finalErrors = methods.formState.errors
        
        if (finalErrors.category_id || finalErrors.governorate_id) {
          console.error("❌ Still have validation errors after fixes!")
          console.error("❌ Category error:", finalErrors.category_id)
          console.error("❌ Governorate error:", finalErrors.governorate_id)
        } else {
          console.log("✅ All validation errors fixed!")
        }
      }, 100)
      
    } catch (error) {
      console.error("❌ Error tracking validation errors:", error)
    }
  }

  // Category handlers
  const handleCategoryChange = async (categoryId: string) => {
    const category = categories.find((cat: Category) => cat.id.toString() === categoryId)
    if (!category) {
      return
    }

    setSelectedCategory(category)
    setValue("category_id", categoryId)

    // Filter sub categories from the selected category's children
    if (category.children && category.children.length > 0) {
      setSubCategories(category.children)
      setSelectedSubCategory(null)
      setSelectedSubSubCategory(null)
      setAvailableProperties([])
      setAvailableFeatures([])
    } else {
      try {
        const response = await api.get(`/user/categories?parent_id=${categoryId}`)
        if (!response.isError && response.data) {
          setSubCategories(response.data)
        } else {
          setSubCategories([])
        }
      } catch (error) {
        console.error("❌ Error loading sub categories:", error)
        setSubCategories([])
      }

      setSelectedSubCategory(null)
      setSelectedSubSubCategory(null)
      setAvailableProperties([])
      setAvailableFeatures([])
    }

  }

  const handleSubCategoryChange = async (subCategoryId: string) => {
    const subCategory = subCategories.find((cat: Category) => cat.id.toString() === subCategoryId)

    if (subCategory) {
      setSelectedSubCategory(subCategory)

      // تحقق من وجود خصائص ومميزات في التصنيف الفرعي
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

      // Filter sub-sub categories from the selected sub category's children
      if (subCategory.children && subCategory.children.length > 0) {
        setSubSubCategories(subCategory.children)
        setSelectedSubSubCategory(null)
        // لا نمسح الخصائص والمميزات هنا لأنها قد تكون من التصنيف الفرعي
      } else {
        // تحميل التصنيفات الفرعية للفرعي من API
        try {
          const response = await api.get(`/user/categories?parent_id=${subCategoryId}`)
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
  }

  const handleSubSubCategoryChange = async (subSubCategoryId: string) => {
    const subSubCategory = subSubCategories.find((cat: Category) => cat.id.toString() === subSubCategoryId)

    if (subSubCategory) {
      setSelectedSubSubCategory(subSubCategory)

      // Load properties and features for the final category
      if (subSubCategory.properties && subSubCategory.properties.length > 0) {
        setAvailableProperties(subSubCategory.properties)
      } else {
        // تحميل الخصائص من API
        try {
          const response = await api.get(`/user/categories/${subSubCategoryId}/properties`)
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
        // تحميل المميزات من API
        try {
          const response = await api.get(`/user/categories/${subSubCategoryId}/features`)
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
  }

  // Navigation handlers
  const handleNext = () => {
    // Validate current step before proceeding
    const isValid = validateCurrentStep()
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Validate current step
  const validateCurrentStep = () => {
    const currentValues = methods.getValues()
    let isValid = true

    try {
      // Validate based on current step
      switch (currentStep) {
        case 1: // Basic Info
          if (!currentValues.title?.ar?.trim()) {
            methods.setError("title.ar", { message: "العنوان بالعربية مطلوب" })
            isValid = false
          }
          if (!currentValues.type) {
            methods.setError("type", { message: "نوع العقار مطلوب" })
            isValid = false
          }
          if (!currentValues.category_id) {
            methods.setError("category_id", { message: "التصنيف مطلوب" })
            isValid = false
          }
          break
        case 2: // Location
          if (!currentValues.governorate_id) {
            methods.setError("governorate_id", { message: "المحافظة مطلوبة" })
            isValid = false
          }
          if (!isLocationSelected) {
            methods.setError("latitude", { message: "يرجى تحديد الموقع على الخريطة" })
            isValid = false
          }
          break
        case 3: // Images
          if (!currentValues.media || currentValues.media.length === 0) {
            methods.setError("media", { message: "يجب رفع صورة واحدة على الأقل" })
            isValid = false
          }
          break
        case 4: // Price
          if (!currentValues.price || currentValues.price <= 0) {
            methods.setError("price", { message: "السعر مطلوب ويجب أن يكون أكبر من صفر" })
            isValid = false
          }
          break
      }
    } catch (error) {
      console.error("❌ Validation error:", error)
      isValid = false
    }

    return isValid
  }

  const handleEditStep = (step: number) => {
    setCurrentStep(step)
  }

  // Handle location selection
  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setValue("latitude", lat)
    setValue("longitude", lng)
    setIsLocationSelected(true)
  }

  // Form submission
  const onSubmit = async (data: ListingFormData) => {
    console.log("🚀 Form submission started - Editing:", isEditing, "ID:", listingId)

    // Validate form before submission
    const isValid = await methods.trigger()
    console.log("🔍 Form validation result:", isValid)

    if (!isValid) {
      const validationErrors = methods.formState.errors
      console.error("❌ Form validation failed:", validationErrors)

      // Show specific error messages
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
      if (isEditing && listingId) {
        console.log("🔄 Updating existing listing...")
        await updateMutation.mutateAsync(data)
      } else {
        console.log("🆕 Creating new listing...")
        await createMutation.mutateAsync(data)
      }
    } catch (error: any) {
      console.error("❌ Form submission error:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء حفظ الإعلان"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAnother = () => {
    setShowSuccess(false)
    setCurrentStep(1)
    setIsLocationSelected(false)
    setPreviewUrls([])
    methods.reset()
  }



  return (
    <FormProvider {...methods}>
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">
              {isEditing ? "تعديل الإعلان" : "إنشاء إعلان"}
            </h1>
          </div>

          {/* Only show StepIndicator if not editing */}
          {!isEditing && <StepIndicator steps={STEPS} currentStep={currentStep} />}
        </div>
      </div>

      <div className="container max-w-2xl flex flex-col gap-4 mx-auto px-4 py-6">

        {/* Basic Info Step - Step 1 for new users, Step 5 for editing */}
        {(currentStep === 1 || currentStep === 5 || isEditing) && (
          <BasicInfoStep
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
            showNavigation={currentStep === 1}
          />
        )}

        {/* Location Step - Step 2 for new users, Step 5 for editing */}
        {(currentStep === 2 || currentStep === 5 || isEditing) && (
          <LocationStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            governorates={governorates}
            cities={cities}
            onLocationSelect={handleLocationSelect}
            isLocationSelected={isLocationSelected}
            showNavigation={currentStep === 2}
          />
        )}

        {/* Images Step - Step 3 for new users, Step 5 for editing */}
        {(currentStep === 3 || currentStep === 5 || isEditing) && (
          <ImagesStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            showNavigation={currentStep === 3}
            previewUrls={previewUrls}
            setPreviewUrls={setPreviewUrls}
          />
        )}

        {/* Price Step - Step 4 for new users, Step 5 for editing */}
        {(currentStep === 4 || currentStep === 5 || isEditing) && (
          <PriceStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            showNavigation={currentStep === 4}
          />
        )}


        {/* Submit button for editing mode */}
        {(currentStep === 5 || isEditing) && (
          <div className="space-y-4">
            <Button
              onClick={() => {
                console.log("🔘 Submit button clicked - Step:", currentStep, "Editing:", isEditing)
                handleSubmit(onSubmit)()
              }}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "جاري الحفظ..." : (isEditing ? "حفظ التعديلات" : "إرسال للمراجعة")}
            </Button>
          </div>
        )}
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        onCreateAnother={handleCreateAnother}
        isEditing={isEditing}
      />
    </FormProvider>
  )
}
