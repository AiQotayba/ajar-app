"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ListingFormData, Category, Property, Feature } from "../types"
import { useLocale } from "next-intl"

interface BasicInfoStepProps {
  onNext: () => void
  categories?: Category[]
  subCategories?: Category[]
  subSubCategories?: Category[]
  selectedCategory?: Category | null
  selectedSubCategory?: Category | null
  selectedSubSubCategory?: Category | null
  availableProperties?: Property[]
  availableFeatures?: Feature[]
  onCategoryChange?: (categoryId: string) => void
  onSubCategoryChange?: (subCategoryId: string) => void
  onSubSubCategoryChange?: (subSubCategoryId: string) => void
}

export function BasicInfoStep({
  onNext,
  categories = [],
  subCategories = [],
  subSubCategories = [],
  selectedCategory,
  selectedSubCategory,
  selectedSubSubCategory,
  availableProperties = [],
  availableFeatures = [],
  onCategoryChange,
  onSubCategoryChange,
  onSubSubCategoryChange
}: BasicInfoStepProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()
  const locale = useLocale()

  // Debug logging
  console.log("🔍 BasicInfoStep Props:", {
    categoriesCount: categories.length,
    subCategoriesCount: subCategories.length,
    subSubCategoriesCount: subSubCategories.length,
    selectedCategory: selectedCategory?.name?.ar,
    selectedSubCategory: selectedSubCategory?.name?.ar,
    selectedSubSubCategory: selectedSubSubCategory?.name?.ar,
    availablePropertiesCount: availableProperties.length,
    availableFeaturesCount: availableFeatures.length
  })

  console.log("🔍 Sub Categories Details:", subCategories)
  console.log("🔍 Sub Sub Categories Details:", subSubCategories)

  // Debug render
  console.log("🔍 BasicInfoStep RENDER:", {
    timestamp: new Date().toISOString(),
    subCategoriesLength: subCategories.length,
    subCategoriesFirstItem: subCategories[0],
    shouldShowSubCategory: subCategories.length > 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }
  function Option({ className, classNameSub, text, onClick }: { className: string, classNameSub: any, text: string, onClick: () => void }) {
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
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Arabic */}
      <div className="space-y-2">
        <Label htmlFor="title_ar" className="text-right block">
          العنوان <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title[ar]"
          {...register("title.ar", { required: "العنوان بالعربية مطلوب" })}
          placeholder="اكتب عنواناً واضحاً بالعربية"
          className="text-right"
        />
        {errors.title?.ar && (
          <p className="text-xs text-destructive text-right">{errors.title.ar.message}</p>
        )}
        <Input
          id="title[en]"
          {...register("title.en")}
          placeholder="Enter title in English"
          className="text-left"
        />
      </div>

      {/* Description Arabic */}
      <div className="space-y-2">
        <Label htmlFor="description_ar" className="text-right block">
          الوصف
        </Label>
        <textarea
          id="description[ar]"
          {...register("description.ar")}
          placeholder="اكتب وصفاً مفصلاً للعقار"
          className="w-full p-3 border border-input rounded-md text-right resize-none"
          rows={3}
        />
        <textarea
          id="description[en]"
          {...register("description.en")}
          placeholder="Enter detailed description in English"
          className="w-full p-3 border border-input rounded-md text-left resize-none"
          rows={3}
        />
      </div>

      {/* Property Type - Group Select */}
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

      {/* Availability Status - Group Select */}
      <div className="space-y-2">
        <Label className="text-right block text-lg font-semibold">
          حالة التوفر <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <Option
            className={watch("availability_status") === "available" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("availability_status") === "available" && "bg-primary"}
            text="متاح"
            onClick={() => setValue("availability_status", "available")}
          />
          <Option
            className={watch("availability_status") === "reserved" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("availability_status") === "reserved" && "bg-primary"}
            text="محجوز"
            onClick={() => setValue("availability_status", "reserved")}
          />
          <Option
            className={watch("availability_status") === "sold" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("availability_status") === "sold" && "bg-primary"}
            text="مباع"
            onClick={() => setValue("availability_status", "sold")}
          />
        </div>
        {errors.availability_status && (
          <p className="text-xs text-destructive text-right">{errors.availability_status.message}</p>
        )}
      </div>

      {/* Main Category */}
      <div className="space-y-2">
        <Label htmlFor="main_category" className="text-right block">
          التصنيف الرئيسي <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("category_id")}
          onValueChange={(value) => {
            setValue("category_id", value)
            onCategoryChange?.(value)
          }}
        >
          <SelectTrigger id="main_category" className="text-right">
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
      {(() => {
        const shouldRender = subCategories.length > 0
        console.log("🔍 Sub Category Render Check:", {
          subCategoriesLength: subCategories.length,
          subCategories: subCategories,
          shouldRender: shouldRender,
          firstCategory: subCategories[0]
        })
        return shouldRender
      })() && (
          <div className="space-y-2">
            <Label htmlFor="sub_category" className="text-right block">
              التصنيف الفرعي <span className="text-destructive">*</span>
            </Label>
            <div className="text-xs text-gray-500 mb-2">
            </div>
            <Select
              value={selectedSubCategory?.id.toString() || ""}
              onValueChange={(value) => {
                console.log("🔍 Sub Category Selected:", value)
                onSubCategoryChange?.(value)
              }}
            >
              <SelectTrigger id="sub_category" className="text-right">
                <SelectValue placeholder="اختر التصنيف الفرعي" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.length > 0 ? (
                  subCategories.map((category) => {
                    console.log("🔍 Rendering sub category:", category)
                    return (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name.ar}
                      </SelectItem>
                    )
                  })
                ) : (
                  <SelectItem value="no-data" disabled>
                    لا توجد تصنيفات فرعية
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

      {/* Sub-Sub Category */}
      {subSubCategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="sub_sub_category" className="text-right block">
            التصنيف الفرعي للفرعي <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedSubSubCategory?.id.toString() || ""}
            onValueChange={(value) => onSubSubCategoryChange?.(value)}
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
                        property.options.map((option, index) => (
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
          <div className="text-xs text-gray-500 mb-2">
            Debug: {availableFeatures.length} ميزة متاحة
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableFeatures.map((feature) => {
              console.log("🔍 Rendering feature:", feature)
              return (
                <div key={feature.id} className="flex items-center space-x-2 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id={`feature_${feature.id}`}
                    checked={watch("features")?.includes(feature.id.toString()) || false}
                    onChange={(e) => {
                      const newFeatures = [...(watch("features") || [])]
                      if (e.target.checked) {
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
                    className="rounded border-gray-300 h-4 w-4 text-blue-600 focus:ring-blue-500"
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
              )
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl">
        التالي
      </Button>
    </form>
  )
}
