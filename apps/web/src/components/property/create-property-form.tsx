"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "./create-property/step-indicator"
import { BasicInfoStep } from "./create-property/basic-info-step"
import { LocationStep } from "./create-property/location-step"
import { ImagesStep } from "./create-property/images-step"
import { PriceStep } from "./create-property/price-step"
import { ReviewStep } from "./create-property/review-step"
import { SuccessModal } from "./create-property/success-modal"

export type PropertyFormData = {
  // Basic Info
  title: string
  propertyType: string
  category: string
  area: string
  rooms: string
  furnished: "furnished" | "unfurnished"
  // Location
  governorate: string
  city: string
  latitude: number | null
  longitude: number | null
  // Images
  images: { url: string; isCover: boolean }[]
  // Price
  price: string
  paymentFrequency: string
  insurance: string
}

const STEPS = [
  { id: 1, label: "بيانات أساسية", key: "basic" },
  { id: 2, label: "الموقع", key: "location" },
  { id: 3, label: "الصور", key: "images" },
  { id: 4, label: "السعر", key: "price" },
  { id: 5, label: "مراجعة وإرسال", key: "review" },
] as const

interface CreatePropertyFormProps {
  initialData?: Partial<PropertyFormData>
  isEditing?: boolean
}

export function CreatePropertyForm({ initialData, isEditing = false }: CreatePropertyFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData?.title || "",
    propertyType: initialData?.propertyType || "",
    category: initialData?.category || "",
    area: initialData?.area || "",
    rooms: initialData?.rooms || "",
    furnished: initialData?.furnished || "furnished",
    governorate: initialData?.governorate || "",
    city: initialData?.city || "",
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    images: initialData?.images || [],
    price: initialData?.price || "",
    paymentFrequency: initialData?.paymentFrequency || "",
    insurance: initialData?.insurance || "",
  })

  const updateFormData = (data: Partial<PropertyFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
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

  const handleSubmit = () => {
    // Submit form data
    console.log(isEditing ? "Updating:" : "Submitting:", formData)
    setShowSuccess(true)
  }

  const handleCreateAnother = () => {
    setShowSuccess(false)
    setCurrentStep(1)
    setFormData({
      title: "",
      propertyType: "",
      category: "",
      area: "",
      rooms: "",
      furnished: "furnished",
      governorate: "",
      city: "",
      latitude: null,
      longitude: null,
      images: [],
      price: "",
      paymentFrequency: "",
      insurance: "",
    })
  }

  return (
    <>
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">{isEditing ? "تعديل الإعلان" : "إنشاء إعلان"}</h1>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6">
        {currentStep === 1 && <BasicInfoStep data={formData} updateData={updateFormData} onNext={handleNext} />}
        {currentStep === 2 && (
          <LocationStep data={formData} updateData={updateFormData} onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 3 && (
          <ImagesStep data={formData} updateData={updateFormData} onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 4 && (
          <PriceStep data={formData} updateData={updateFormData} onNext={handleNext} onPrevious={handlePrevious} />
        )}
        {currentStep === 5 && (
          <ReviewStep data={formData} onSubmit={handleSubmit} onPrevious={handlePrevious} onEditStep={handleEditStep} />
        )}
      </div>

      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} onCreateAnother={handleCreateAnother} />
    </>
  )
}
