"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "./create-property/step-indicator"
import { BasicInfoStep } from "./create-property/basic-info-step"
import { LocationStep } from "./create-property/location-step"
import { ImagesStep } from "./create-property/images-step"
import { PriceStep } from "./create-property/price-step"
import { ReviewStep } from "./create-property/review-step"
import { SuccessModal } from "./create-property/success-modal"
import { api } from "@/lib/api"
import { toast } from "sonner"

// Enhanced PropertyFormData type based on API requirements
export type PropertyFormData = {
  // Basic Info (Step 1)
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  type: string
  category_id: string
  properties: Array<{id: number, value: string}>
  features: string[]
  
  // Location (Step 2)
  governorate_id: string
  city_id: string
  latitude: number | null
  longitude: number | null
  
  // Images (Step 3)
  media: File[]
  cover_image_index: number
  
  // Price (Step 4)
  price: string
  currency: string
  availability_status: string
  status: string
  
  // Legacy fields for backward compatibility
  title?: string
  propertyType?: string
  category?: string
  area?: string
  rooms?: string
  furnished?: "furnished" | "unfurnished"
  governorate?: string
  city?: string
  images?: { url: string; isCover: boolean }[]
  paymentFrequency?: string
  insurance?: string
  coverImageIndex?: number
}

// API Response Types
interface Category {
  id: number
  name_ar: string
  name_en: string
  parent_id?: number
  children?: Category[]
  properties?: Property[]
  features?: Feature[]
}

interface Property {
  id: number
  name_ar: string
  name_en: string
  type: string
  required: boolean
}

interface Feature {
  id: number
  name_ar: string
  name_en: string
  icon?: string
}

interface Governorate {
  id: number
  name_ar: string
  name_en: string
  cities: City[]
}

interface City {
  id: number
  name_ar: string
  name_en: string
  governorate_id: number
}

const STEPS = [
  { id: 1, label: "بيانات أساسية", key: "basic" },
  { id: 2, label: "الموقع", key: "location" },
  { id: 3, label: "الصور", key: "images" },
  { id: 4, label: "السعر", key: "price" },
  { id: 5, label: "مراجعة وإرسال", key: "review" },
] as const

interface PropertyFormEngineProps {
  initialData?: Partial<PropertyFormData>
  isEditing?: boolean
  listingId?: string | number
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

export function PropertyFormEngine({ 
  initialData, 
  isEditing = false, 
  listingId,
  onSuccess,
  onCancel 
}: PropertyFormEngineProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<Category[]>([])
  const [subSubCategories, setSubSubCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null)
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<Category | null>(null)
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([])
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [cities, setCities] = useState<City[]>([])
  
  // Initialize React Hook Form
  const methods = useForm<PropertyFormData>({
    defaultValues: {
      // Basic Info
      title_ar: initialData?.title_ar || initialData?.title || "",
      title_en: initialData?.title_en || "",
      description_ar: initialData?.description_ar || "",
      description_en: initialData?.description_en || "",
      type: initialData?.type || initialData?.propertyType || "",
      category_id: initialData?.category_id || initialData?.category || "",
      properties: initialData?.properties || [],
      features: initialData?.features || [],
      
      // Location
      governorate_id: initialData?.governorate_id || "",
      city_id: initialData?.city_id || "",
      latitude: initialData?.latitude || null,
      longitude: initialData?.longitude || null,
      
      // Images
      media: initialData?.media || [],
      cover_image_index: initialData?.cover_image_index || initialData?.coverImageIndex || 0,
      
      // Price
      price: initialData?.price || "",
      currency: initialData?.currency || "USD",
      availability_status: initialData?.availability_status || "available",
      status: initialData?.status || "active",
      
      // Legacy fields
      title: initialData?.title || "",
      propertyType: initialData?.propertyType || "",
      category: initialData?.category || "",
      area: initialData?.area || "",
      rooms: initialData?.rooms || "",
      furnished: initialData?.furnished || "furnished",
      governorate: initialData?.governorate || "",
      city: initialData?.city || "",
      images: initialData?.images || [],
      paymentFrequency: initialData?.paymentFrequency || "",
      insurance: initialData?.insurance || "",
      coverImageIndex: initialData?.coverImageIndex || 0,
    },
    mode: "onChange"
  })

  const { watch, setValue, getValues, handleSubmit, formState: { errors } } = methods

  // Load initial data for editing
  useEffect(() => {
    if (isEditing && listingId) {
      loadListingData()
    }
  }, [isEditing, listingId])

  // Load categories and governorates
  useEffect(() => {
    loadCategories()
    loadGovernorates()
  }, [])

  // Load cities when governorate changes
  useEffect(() => {
    if (watch("governorate_id")) {
      loadCities(watch("governorate_id"))
    }
  }, [watch("governorate_id")])

  const loadListingData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/user/listings/${listingId}`)
      
      if (!response.isError && response.data) {
        const listing = response.data
        setFormData({
          title_ar: listing.title_ar || "",
          title_en: listing.title_en || "",
          description_ar: listing.description_ar || "",
          description_en: listing.description_en || "",
          type: listing.type || "",
          category_id: listing.category_id?.toString() || "",
          properties: listing.properties || [],
          features: listing.features || [],
          governorate_id: listing.governorate_id?.toString() || "",
          city_id: listing.city_id?.toString() || "",
          latitude: listing.latitude,
          longitude: listing.longitude,
          media: listing.media || [],
          cover_image_index: listing.cover_image_index || 0,
          price: listing.price?.toString() || "",
          currency: listing.currency || "USD",
          availability_status: listing.availability_status || "available",
          status: listing.status || "active",
        })
      }
    } catch (error) {
      console.error("Error loading listing data:", error)
      toast.error("فشل في تحميل بيانات الإعلان")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.get("/user/categories")
      if (!response.isError && response.data) {
        // Filter only main categories (parent_id is null)
        const mainCategories = response.data.filter((cat: Category) => !cat.parent_id)
        setCategories(mainCategories)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadSubCategories = async (parentId: number) => {
    try {
      const response = await api.get(`/user/categories?parent_id=${parentId}`)
      if (!response.isError && response.data) {
        setSubCategories(response.data)
        setSubSubCategories([]) // Reset sub-sub categories
        setSelectedSubCategory(null)
        setSelectedSubSubCategory(null)
      }
    } catch (error) {
      console.error("Error loading sub categories:", error)
    }
  }

  const loadSubSubCategories = async (parentId: number) => {
    try {
      const response = await api.get(`/user/categories?parent_id=${parentId}`)
      if (!response.isError && response.data) {
        setSubSubCategories(response.data)
        setSelectedSubSubCategory(null)
      }
    } catch (error) {
      console.error("Error loading sub-sub categories:", error)
    }
  }

  const loadCategoryDetails = async (categoryId: number) => {
    try {
      const response = await api.get(`/user/categories/${categoryId}`)
      if (!response.isError && response.data) {
        const category = response.data
        setAvailableProperties(category.properties || [])
        setAvailableFeatures(category.features || [])
      }
    } catch (error) {
      console.error("Error loading category details:", error)
    }
  }

  const loadGovernorates = async () => {
    try {
      const response = await api.get("/user/governorates")
      if (!response.isError && response.data) {
        setGovernorates(response.data)
      }
    } catch (error) {
      console.error("Error loading governorates:", error)
    }
  }

  const loadCities = async (governorateId: string) => {
    try {
      const governorate = governorates.find(g => g.id.toString() === governorateId)
      if (governorate) {
        setCities(governorate.cities || [])
      }
    } catch (error) {
      console.error("Error loading cities:", error)
    }
  }

  const updateFormData = useCallback((data: Partial<PropertyFormData>) => {
    Object.keys(data).forEach((key) => {
      setValue(key as keyof PropertyFormData, data[key as keyof PropertyFormData] as any)
    })
  }, [setValue])

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(cat => cat.id.toString() === categoryId)
    if (category) {
      setSelectedCategory(category)
      setValue("category_id", categoryId)
      loadSubCategories(category.id)
    }
  }

  const handleSubCategoryChange = (subCategoryId: string) => {
    const subCategory = subCategories.find(cat => cat.id.toString() === subCategoryId)
    if (subCategory) {
      setSelectedSubCategory(subCategory)
      loadSubSubCategories(subCategory.id)
    }
  }

  const handleSubSubCategoryChange = (subSubCategoryId: string) => {
    const subSubCategory = subSubCategories.find(cat => cat.id.toString() === subSubCategoryId)
    if (subSubCategory) {
      setSelectedSubSubCategory(subSubCategory)
      loadCategoryDetails(subSubCategory.id)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleEditStep = (step: number) => {
    setCurrentStep(step)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(watch("title_ar") && watch("type") && watch("category_id"))
      case 2:
        return !!(watch("governorate_id") && watch("city_id") && watch("latitude") && watch("longitude"))
      case 3:
        return watch("media").length > 0
      case 4:
        return !!(watch("price") && watch("currency"))
      default:
        return true
    }
  }

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsLoading(true)
      
      // Prepare form data for API
      const submitData = {
        title_ar: formData.title_ar,
        title_en: formData.title_en,
        description_ar: formData.description_ar,
        description_en: formData.description_en,
        type: formData.type,
        category_id: parseInt(formData.category_id),
        properties: formData.properties,
        features: formData.features,
        governorate_id: parseInt(formData.governorate_id),
        city_id: parseInt(formData.city_id),
        latitude: formData.latitude,
        longitude: formData.longitude,
        price: parseFloat(formData.price),
        currency: formData.currency,
        availability_status: formData.availability_status,
        status: formData.status,
      }

      let response
      if (isEditing && listingId) {
        // Update existing listing
        response = await api.put(`/user/listings/${listingId}`, submitData)
      } else {
        // Create new listing
        response = await api.post("/user/listings", submitData)
      }

      if (!response.isError) {
        toast.success(isEditing ? "تم تحديث الإعلان بنجاح" : "تم إنشاء الإعلان بنجاح")
        setShowSuccess(true)
        onSuccess?.(response.data)
      } else {
        toast.error(response.message || "حدث خطأ أثناء حفظ الإعلان")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("حدث خطأ أثناء حفظ الإعلان")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAnother = () => {
    setShowSuccess(false)
    setCurrentStep(1)
    methods.reset({
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      type: "",
      category_id: "",
      properties: [],
      features: [],
      governorate_id: "",
      city_id: "",
      latitude: null,
      longitude: null,
      media: [],
      cover_image_index: 0,
      price: "",
      currency: "USD",
      availability_status: "available",
      status: "active",
    })
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      window.history.back()
    }
  }

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات الإعلان...</p>
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">
              {isEditing ? "تعديل الإعلان" : "إنشاء إعلان"}
            </h1>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  إلغاء
                </Button>
              )}
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6">
        {currentStep === 1 && (
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
          />
        )}
        {currentStep === 2 && (
          <LocationStep 
            data={formData} 
            updateData={updateFormData} 
            onNext={handleNext} 
            onPrevious={handlePrevious}
            governorates={governorates}
            cities={cities}
          />
        )}
        {currentStep === 3 && (
          <ImagesStep 
            data={formData} 
            updateData={updateFormData} 
            onNext={handleNext} 
            onPrevious={handlePrevious} 
          />
        )}
        {currentStep === 4 && (
          <PriceStep 
            data={formData} 
            updateData={updateFormData} 
            onNext={handleNext} 
            onPrevious={handlePrevious} 
          />
        )}
        {currentStep === 5 && (
          <ReviewStep 
            data={formData} 
            onSubmit={handleSubmit} 
            onPrevious={handlePrevious} 
            onEditStep={handleEditStep}
            isEditing={isEditing}
            isLoading={isLoading}
          />
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

