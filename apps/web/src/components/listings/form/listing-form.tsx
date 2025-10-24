"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { createListing, updateListing, transformFormDataToAPI } from "@/lib/api/listings"
import { listingFormSchema, type ListingFormData, type Category, type Governorate, type City } from "./types"
import { StepIndicator, SuccessModal } from "./components"
import { BasicInfoStep } from "./steps/basic-info-step"
import { LocationStep } from "./steps/location-step"
import { ImagesStep } from "./steps/images-step"
import { PriceStep } from "./steps/price-step"
import { ReviewStep } from "./steps/review-step"

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
  const [currentStep, setCurrentStep] = useState(1)
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

  // Debug subCategories changes
  useEffect(() => {
    console.log("🔄 Sub Categories State Changed:", {
      count: subCategories.length,
      categories: subCategories.map(cat => ({ id: cat.id, name: cat.name?.ar }))
    })
  }, [subCategories])

  // Debug subSubCategories changes
  useEffect(() => {
    console.log("🔄 Sub Sub Categories State Changed:", {
      count: subSubCategories.length,
      categories: subSubCategories.map(cat => ({ id: cat.id, name: cat.name?.ar }))
    })
  }, [subSubCategories])

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
      latitude: initialData?.latitude || null,
      longitude: initialData?.longitude || null,
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
      console.log("🔄 Loading categories...")
      const response = await api.get("/user/categories")
      console.log("📡 API Response:", response)
      
      if (response.isError) {
        console.error("❌ Categories API Error:", response.message)
        throw new Error(response.message)
      }
      
      console.log("📊 Raw categories data:", response.data)
      console.log("📊 Categories data type:", typeof response.data)
      console.log("📊 Categories data length:", Array.isArray(response.data) ? response.data.length : "Not an array")
      
      if (response.data && Array.isArray(response.data)) {
        const mainCategories = response.data.filter((cat: Category) => !cat.parent_id)
        console.log("🏠 Main categories found:", mainCategories.length)
        console.log("🏠 Main categories details:", mainCategories)
        
        // تحقق من وجود children في كل تصنيف
        mainCategories.forEach((cat, index) => {
          console.log(`🏠 Category ${index + 1} (${cat.name?.ar}):`, {
            id: cat.id,
            name: cat.name,
            hasChildren: !!cat.children,
            childrenCount: cat.children?.length || 0,
            children: cat.children
          })
        })
        
        return mainCategories
      }
      
      console.log("⚠️ No valid categories data found")
      return []
    },
  })

  const { data: governorates = [] } = useQuery({
    queryKey: ['governorates'],
    queryFn: async () => {
      const response = await api.get("/user/governorates")
      if (response.isError) throw new Error(response.message)
      return response.data || []
    },
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
  })

  // Mutations
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      console.log("🚀 ===== SUBMITTING LISTING DATA =====")
      console.log("🚀 Raw form data:", data)
      
      // Transform data using the dedicated function
      const transformedData = transformFormDataToAPI(data)
      
      // Call the API
      const result = await createListing(transformedData)
      
      console.log("✅ Listing created successfully:", result)
      return result
    },
    onSuccess: (data) => {
      console.log("✅ Listing created successfully:", data)
      toast.success("تم إنشاء الإعلان بنجاح")
      setShowSuccess(true)
      onSuccess?.(data)
    },
    onError: (error) => {
      console.error("❌ Create error:", error)
      toast.error("حدث خطأ أثناء إنشاء الإعلان")
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      console.log("🔄 ===== UPDATING LISTING DATA =====")
      console.log("🔄 Raw form data:", data)
      
      // Transform data using the dedicated function
      const transformedData = transformFormDataToAPI(data)
      
      // Call the API
      const result = await updateListing(parseInt(listingId!.toString()), transformedData)
      
      console.log("✅ Listing updated successfully:", result)
      return result
    },
    onSuccess: (data) => {
      console.log("✅ Listing updated successfully:", data)
      toast.success("تم تحديث الإعلان بنجاح")
      setShowSuccess(true)
      onSuccess?.(data)
    },
    onError: (error) => {
      console.error("❌ Update error:", error)
      toast.error("حدث خطأ أثناء تحديث الإعلان")
    },
  })

  // Load initial data for editing
  useEffect(() => {
    if (isEditing && listingId) {
      loadListingData()
    }
  }, [isEditing, listingId])

  const loadListingData = async () => {
    try {
      const response = await api.get(`/user/listings/${listingId}`)
      if (!response.isError && response.data) {
        const listing = response.data
        methods.reset({
          ...listing,
          category_id: listing.category_id?.toString() || "",
          governorate_id: listing.governorate_id?.toString() || "",
          city_id: listing.city_id?.toString() || "",
        })
      }
    } catch (error) {
      console.error("Error loading listing data:", error)
      toast.error("حدث خطأ أثناء تحميل بيانات الإعلان")
    }
  }

  // Category handlers
  const handleCategoryChange = async (categoryId: string) => {
    console.log("🎯 ===== CATEGORY CHANGE START =====")
    console.log("🎯 Selected category ID:", categoryId)
    console.log("🎯 Available categories:", categories)
    console.log("🎯 Categories count:", categories.length)
    
    const category = categories.find((cat: Category) => cat.id.toString() === categoryId)
    console.log("🎯 Found category:", category)
    
    if (!category) {
      console.error("❌ Category not found!")
      return
    }
    
    console.log("🎯 Category details:", {
      id: category.id,
      name: category.name,
      hasChildren: !!category.children,
      childrenCount: category.children?.length || 0,
      children: category.children
    })
    
    setSelectedCategory(category)
    setValue("category_id", categoryId)
    
    // Filter sub categories from the selected category's children
    if (category.children && category.children.length > 0) {
      console.log("✅ Found children in category data")
      console.log("✅ Children count:", category.children.length)
      console.log("✅ Children details:", category.children)
      setSubCategories(category.children)
      setSelectedSubCategory(null)
      setSelectedSubSubCategory(null)
      setAvailableProperties([])
      setAvailableFeatures([])
      console.log("✅ Sub categories set successfully")
    } else {
      console.log("⚠️ No children found in category data, loading from API")
      console.log("🔄 Making API call to:", `/user/categories?parent_id=${categoryId}`)
      
      try {
        console.log("🔄 Making API call to:", `/user/categories?parent_id=${categoryId}`)
        const response = await api.get(`/user/categories?parent_id=${categoryId}`)
        console.log("📡 Full API Response for sub categories:", response)
        console.log("📡 Response isError:", response.isError)
        console.log("📡 Response data:", response.data)
        console.log("📡 Response data type:", typeof response.data)
        console.log("📡 Response data length:", Array.isArray(response.data) ? response.data.length : "Not an array")
        
        if (!response.isError && response.data) {
          console.log("✅ Loaded sub categories from API:", response.data)
          console.log("✅ Sub categories count:", response.data.length)
          console.log("✅ Sub categories details:", response.data.map((cat: any) => ({ id: cat.id, name: cat.name?.ar })))
          setSubCategories(response.data)
        } else {
          console.log("⚠️ No sub categories found in API response")
          console.log("⚠️ API Error:", response.message)
          console.log("⚠️ Response data:", response.data)
          setSubCategories([])
        }
      } catch (error) {
        console.error("❌ Error loading sub categories:", error)
        console.error("❌ Error details:", error)
        setSubCategories([])
      }
      
      setSelectedSubCategory(null)
      setSelectedSubSubCategory(null)
      setAvailableProperties([])
      setAvailableFeatures([])
    }
    
    console.log("🎯 ===== CATEGORY CHANGE END =====")
  }

  const handleSubCategoryChange = async (subCategoryId: string) => {
    console.log("🎯 ===== SUB CATEGORY CHANGE START =====")
    console.log("🎯 Selected sub category ID:", subCategoryId)
    const subCategory = subCategories.find((cat: Category) => cat.id.toString() === subCategoryId)
    console.log("🎯 Found sub category:", subCategory)
    
    if (subCategory) {
      setSelectedSubCategory(subCategory)
      
      // تحقق من وجود خصائص ومميزات في التصنيف الفرعي
      if (subCategory.properties && subCategory.properties.length > 0) {
        console.log("✅ Found properties in sub category:", subCategory.properties)
        console.log("✅ Properties count:", subCategory.properties.length)
        setAvailableProperties(subCategory.properties)
      } else {
        console.log("⚠️ No properties found in sub category")
        setAvailableProperties([])
      }
      
      if (subCategory.features && subCategory.features.length > 0) {
        console.log("✅ Found features in sub category:", subCategory.features)
        console.log("✅ Features count:", subCategory.features.length)
        setAvailableFeatures(subCategory.features)
      } else {
        console.log("⚠️ No features found in sub category")
        setAvailableFeatures([])
      }
      
      // Filter sub-sub categories from the selected sub category's children
      if (subCategory.children && subCategory.children.length > 0) {
        console.log("✅ Setting sub-sub categories from children:", subCategory.children)
        setSubSubCategories(subCategory.children)
        setSelectedSubSubCategory(null)
        // لا نمسح الخصائص والمميزات هنا لأنها قد تكون من التصنيف الفرعي
      } else {
        console.log("⚠️ No sub-sub children found, loading from API")
        // تحميل التصنيفات الفرعية للفرعي من API
        try {
          const response = await api.get(`/user/categories?parent_id=${subCategoryId}`)
          if (!response.isError && response.data) {
            console.log("✅ Loaded sub-sub categories from API:", response.data)
            setSubSubCategories(response.data)
          } else {
            console.log("⚠️ No sub-sub categories found in API")
            setSubSubCategories([])
          }
        } catch (error) {
          console.error("❌ Error loading sub-sub categories:", error)
          setSubSubCategories([])
        }
        setSelectedSubSubCategory(null)
      }
    }
    console.log("🎯 ===== SUB CATEGORY CHANGE END =====")
  }

  const handleSubSubCategoryChange = async (subSubCategoryId: string) => {
    console.log("🎯 ===== SUB SUB CATEGORY CHANGE START =====")
    console.log("🎯 Selected sub-sub category ID:", subSubCategoryId)
    const subSubCategory = subSubCategories.find((cat: Category) => cat.id.toString() === subSubCategoryId)
    console.log("🎯 Found sub-sub category:", subSubCategory)
    
    if (subSubCategory) {
      setSelectedSubSubCategory(subSubCategory)
      
      // Load properties and features for the final category
      if (subSubCategory.properties && subSubCategory.properties.length > 0) {
        console.log("✅ Setting properties from sub-sub category:", subSubCategory.properties)
        setAvailableProperties(subSubCategory.properties)
      } else {
        console.log("⚠️ No properties in sub-sub category, loading from API")
        // تحميل الخصائص من API
        try {
          const response = await api.get(`/user/categories/${subSubCategoryId}/properties`)
          if (!response.isError && response.data) {
            console.log("✅ Loaded properties from API:", response.data)
            setAvailableProperties(response.data)
          } else {
            console.log("⚠️ No properties found in API")
            setAvailableProperties([])
          }
        } catch (error) {
          console.error("❌ Error loading properties:", error)
          setAvailableProperties([])
        }
      }
      
      if (subSubCategory.features && subSubCategory.features.length > 0) {
        console.log("✅ Setting features from sub-sub category:", subSubCategory.features)
        console.log("✅ Features count:", subSubCategory.features.length)
        setAvailableFeatures(subSubCategory.features)
      } else {
        console.log("⚠️ No features in sub-sub category, loading from API")
        // تحميل المميزات من API
        try {
          const response = await api.get(`/user/categories/${subSubCategoryId}/features`)
          if (!response.isError && response.data) {
            console.log("✅ Loaded features from API:", response.data)
            console.log("✅ Features count from API:", response.data.length)
            setAvailableFeatures(response.data)
          } else {
            console.log("⚠️ No features found in API")
            setAvailableFeatures([])
          }
        } catch (error) {
          console.error("❌ Error loading features:", error)
          setAvailableFeatures([])
        }
      }
    }
    console.log("🎯 ===== SUB SUB CATEGORY CHANGE END =====")
  }

  // Navigation handlers
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

  // Form submission
  const onSubmit = async (data: ListingFormData) => {
    setIsLoading(true)
    try {
      if (isEditing && listingId) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAnother = () => {
    setShowSuccess(false)
    setCurrentStep(1)
    methods.reset()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      window.history.back()
    }
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
            onNext={handleNext}
            onPrevious={handlePrevious}
            governorates={governorates}
            cities={cities}
          />
        )}
        {currentStep === 3 && (
          <ImagesStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {currentStep === 4 && (
          <PriceStep
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {currentStep === 5 && (
          <ReviewStep
            onSubmit={() => handleSubmit(onSubmit)()}
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
