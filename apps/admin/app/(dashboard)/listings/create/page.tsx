"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/page-header"
import { api } from "@/lib/api"
import { listingFormSchema, type ListingFormData, type Category, type Governorate, type City } from "@/components/pages/listings/form/types"
import { StepIndicator } from "@/components/pages/listings/form/components/step-indicator"
import { BasicInfoStep } from "@/components/pages/listings/form/steps/basic-info-step"
import { LocationStep } from "@/components/pages/listings/form/steps/location-step"
import { ImagesStep } from "@/components/pages/listings/form/steps/images-step"
import { PriceStep } from "@/components/pages/listings/form/steps/price-step"
import { SuccessModal } from "@/components/pages/listings/form/components/success-modal"

const STEPS = [
  { id: 1, label: "البيانات الأساسية", key: "basic" },
  { id: 2, label: "الموقع", key: "location" },
  { id: 3, label: "الصور", key: "images" },
  { id: 4, label: "السعر", key: "price" },
]

export default function CreateListingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
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

  const validatedCoords = validateCoordinates(34.8021, 36.7570)

  // Initialize React Hook Form
  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
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
      payment_frequency: "",
      insurance: 0,
      status: "draft",
      is_featured: false,
    },
    mode: "onChange"
  })

  const { watch, setValue, handleSubmit, trigger } = methods

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
    const stepFields: Record<number, (keyof ListingFormData)[]> = {
      1: ["title", "type", "availability_status", "category_id"],
      2: ["governorate_id", "latitude", "longitude"],
      3: ["images"],
      4: ["price"],
    }

    const fieldsToValidate = stepFields[currentStep] || []
    const isValid = await trigger(fieldsToValidate as any)

    if (!isValid) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة")
      return
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Mutation
  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      console.group("📤 [CREATE MUTATION] Creating listing")
      console.info("📦 [PAYLOAD] Data being sent to API:", data)
      const result = await api.post(`/admin/listings`, data)
      console.info("✅ [RESPONSE] API response:", result)
      console.groupEnd()
      return result
    },
    onSuccess: (data) => {
      console.group("✅ [CREATE SUCCESS] Listing created successfully")
      console.info("📊 [RESPONSE DATA] Created listing data:", data)
      
      queryClient.invalidateQueries({ queryKey: ["table-data", "/admin/listings"] })
      queryClient.invalidateQueries({ queryKey: ["listings"] })
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] })
      
      queryClient.refetchQueries({ queryKey: ["table-data", "/admin/listings"] })
      
      console.info("✨ [SUCCESS] All queries invalidated and refetched")
      console.groupEnd()
      
      setShowSuccess(true)
      setIsLoading(false)
    },
    onError: (error: any) => {
      console.group("❌ [CREATE ERROR] Error creating listing")
      console.error("🔴 [ERROR DETAILS] Full error object:", error)
      console.error("📝 [ERROR MESSAGE] Error message:", error?.message)
      console.error("📋 [ERROR RESPONSE] API response:", error?.response?.data)
      console.groupEnd()
      
      const errorMessage = error?.response?.data?.message || error?.message || "فشل إنشاء الإعلان"
      toast.error(errorMessage)
      setIsLoading(false)
    },
  })

  // Form submission
  const onSubmit = async (data: ListingFormData) => {
    console.group("🚀 [FORM SUBMISSION] Starting form submission")
    console.info("📋 [FORM DATA] Raw form data:", {
      mode: "create",
      data: {
        ...data,
        images: data.images?.length || 0,
        properties: data.properties?.length || 0,
        features: data.features?.length || 0,
      }
    })

    const isValid = await trigger()
    console.info("✅ [VALIDATION] Form validation result:", isValid)

    if (!isValid) {
      const validationErrors = methods.formState.errors
      console.error("❌ [VALIDATION ERRORS] Form validation failed:", validationErrors)
      toast.error("يرجى تصحيح الأخطاء في النموذج")
      console.groupEnd()
      return
    }

    setIsLoading(true)
    try {
      console.info("🆕 [CREATE] Creating new listing")
      await createMutation.mutateAsync(data)
    } catch (error: any) {
      console.error("❌ [SUBMISSION ERROR] Form submission error:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ أثناء حفظ الإعلان"
      toast.error(errorMessage)
      setIsLoading(false)
    } finally {
      console.groupEnd()
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

  const handleClose = () => {
    setShowSuccess(false)
    // SuccessModal will handle navigation
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
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
            mode="create"
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

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8" dir="rtl">
      <PageHeader
        title="إنشاء إعلان جديد"
        description="املأ النموذج خطوة بخطوة لإضافة إعلان جديد"
        icon={Building2}
        actions={[
          {
            label: "العودة للقائمة",
            icon: ArrowRight,
            onClick: () => router.push("/listings"),
          }
        ]}
      />

      <div className="max-w-4xl mx-auto">
        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6 pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl mb-3 sm:mb-4">نموذج إنشاء الإعلان</CardTitle>
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
                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl order-1 sm:order-2"
                    >
                      التالي
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl order-1 sm:order-2"
                    >
                      {isLoading ? "جاري الحفظ..." : "إنشاء الإعلان"}
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
        onCreateAnother={handleCreateAnother}
        isEditing={false}
      />
    </div>
  )
}

