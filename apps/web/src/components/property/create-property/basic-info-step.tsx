"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PropertyFormData } from "../property-form-engine"

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

interface BasicInfoStepProps {
  data: PropertyFormData
  updateData: (data: Partial<PropertyFormData>) => void
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
  data, 
  updateData, 
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }
console.log(categories);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Arabic */}
      <div className="space-y-2">
        <Label htmlFor="title_ar" className="text-right block">
          العنوان بالعربية <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title_ar"
          value={data.title_ar}
          onChange={(e) => updateData({ title_ar: e.target.value })}
          placeholder="اكتب عنواناً واضحاً بالعربية"
          className="text-right"
          required
        />
      </div>

      {/* Title English */}
      <div className="space-y-2">
        <Label htmlFor="title_en" className="text-right block">
          العنوان بالإنجليزية
        </Label>
        <Input
          id="title_en"
          value={data.title_en}
          onChange={(e) => updateData({ title_en: e.target.value })}
          placeholder="Enter title in English"
          className="text-left"
        />
      </div>

      {/* Description Arabic */}
      <div className="space-y-2">
        <Label htmlFor="description_ar" className="text-right block">
          الوصف بالعربية
        </Label>
        <textarea
          id="description_ar"
          value={data.description_ar}
          onChange={(e) => updateData({ description_ar: e.target.value })}
          placeholder="اكتب وصفاً مفصلاً للعقار"
          className="w-full p-3 border border-input rounded-md text-right resize-none"
          rows={3}
        />
      </div>

      {/* Description English */}
      <div className="space-y-2">
        <Label htmlFor="description_en" className="text-right block">
          الوصف بالإنجليزية
        </Label>
        <textarea
          id="description_en"
          value={data.description_en}
          onChange={(e) => updateData({ description_en: e.target.value })}
          placeholder="Enter detailed description in English"
          className="w-full p-3 border border-input rounded-md text-left resize-none"
          rows={3}
        />
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-right block">
          نوع العقار <span className="text-destructive">*</span>
        </Label>
        <Select value={data.type} onValueChange={(value) => updateData({ type: value })}>
          <SelectTrigger id="type" className="text-right">
            <SelectValue placeholder="اختر من القائمة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">شقة</SelectItem>
            <SelectItem value="villa">فيلا</SelectItem>
            <SelectItem value="house">منزل</SelectItem>
            <SelectItem value="office">مكتب</SelectItem>
            <SelectItem value="shop">محل تجاري</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Category */}
      <div className="space-y-2">
        <Label htmlFor="main_category" className="text-right block">
          التصنيف الرئيسي <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={selectedCategory?.id.toString() || ""} 
          onValueChange={(value) => onCategoryChange?.(value)}
        >
          <SelectTrigger id="main_category" className="text-right">
            <SelectValue placeholder="اختر التصنيف الرئيسي" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sub Category */}
      {subCategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="sub_category" className="text-right block">
            التصنيف الفرعي <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={selectedSubCategory?.id.toString() || ""} 
            onValueChange={(value) => onSubCategoryChange?.(value)}
          >
            <SelectTrigger id="sub_category" className="text-right">
              <SelectValue placeholder="اختر التصنيف الفرعي" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name_ar}
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
                  {category.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Area */}
      <div className="space-y-2">
        <Label htmlFor="area" className="text-right block">
          المساحة <span className="text-destructive">*</span>
        </Label>
        <Input
          id="area"
          type="number"
          value={data.area}
          onChange={(e) => updateData({ area: e.target.value })}
          placeholder="يجب أن تكون رقماً"
          className="text-right"
          required
        />
        <p className="text-xs text-muted-foreground text-right">يجب أن تكون رقماً</p>
      </div>

      {/* Rooms */}
      <div className="space-y-2">
        <Label htmlFor="rooms" className="text-right block">
          عدد الغرف <span className="text-destructive">*</span>
        </Label>
        <Input
          id="rooms"
          type="number"
          value={data.rooms}
          onChange={(e) => updateData({ rooms: e.target.value })}
          placeholder="يجب أن تكون رقماً"
          className="text-right"
          required
        />
        <p className="text-xs text-muted-foreground text-right">يجب أن تكون رقماً</p>
      </div>

      {/* Furnished */}
      <div className="space-y-3">
        <RadioGroup
          value={data.furnished}
          onValueChange={(value: "furnished" | "unfurnished") => updateData({ furnished: value })}
          className="flex items-center justify-center gap-8"
        >
          <div className="flex items-center gap-2">
            <Label htmlFor="furnished" className="cursor-pointer">
              مفروش
            </Label>
            <RadioGroupItem value="furnished" id="furnished" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="unfurnished" className="cursor-pointer">
              غير مفروش
            </Label>
            <RadioGroupItem value="unfurnished" id="unfurnished" />
          </div>
        </RadioGroup>
      </div>

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
                  {property.name_ar} {property.required && <span className="text-destructive">*</span>}
                </Label>
                {property.type === 'text' && (
                  <Input
                    id={`property_${property.id}`}
                    value={data.properties?.find(p => p.id === property.id)?.value || ""}
                    onChange={(e) => {
                      const newProperties = [...(data.properties || [])]
                      const existingIndex = newProperties.findIndex(p => p.id === property.id)
                      if (existingIndex >= 0) {
                        newProperties[existingIndex] = { ...newProperties[existingIndex], value: e.target.value }
                      } else {
                        newProperties.push({ id: property.id, value: e.target.value })
                      }
                      updateData({ properties: newProperties })
                    }}
                    placeholder={`أدخل ${property.name_ar}`}
                    className="text-right"
                    required={property.required}
                  />
                )}
                {property.type === 'number' && (
                  <Input
                    id={`property_${property.id}`}
                    type="number"
                    value={data.properties?.find(p => p.id === property.id)?.value || ""}
                    onChange={(e) => {
                      const newProperties = [...(data.properties || [])]
                      const existingIndex = newProperties.findIndex(p => p.id === property.id)
                      if (existingIndex >= 0) {
                        newProperties[existingIndex] = { ...newProperties[existingIndex], value: e.target.value }
                      } else {
                        newProperties.push({ id: property.id, value: e.target.value })
                      }
                      updateData({ properties: newProperties })
                    }}
                    placeholder={`أدخل ${property.name_ar}`}
                    className="text-right"
                    required={property.required}
                  />
                )}
                {property.type === 'select' && (
                  <Select
                    value={data.properties?.find(p => p.id === property.id)?.value || ""}
                    onValueChange={(value) => {
                      const newProperties = [...(data.properties || [])]
                      const existingIndex = newProperties.findIndex(p => p.id === property.id)
                      if (existingIndex >= 0) {
                        newProperties[existingIndex] = { ...newProperties[existingIndex], value }
                      } else {
                        newProperties.push({ id: property.id, value })
                      }
                      updateData({ properties: newProperties })
                    }}
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder={`اختر ${property.name_ar}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">نعم</SelectItem>
                      <SelectItem value="no">لا</SelectItem>
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
          <div className="grid grid-cols-2 gap-3">
            {availableFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id={`feature_${feature.id}`}
                  checked={data.features?.includes(feature.id.toString()) || false}
                  onChange={(e) => {
                    const newFeatures = [...(data.features || [])]
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
                    updateData({ features: newFeatures })
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`feature_${feature.id}`} className="cursor-pointer text-sm">
                  {feature.name_ar}
                </Label>
              </div>
            ))}
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
