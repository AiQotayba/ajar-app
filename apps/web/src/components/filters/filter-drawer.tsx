"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAdvancedFilters } from "@/hooks/use-advanced-filters"
import { useLocale } from "next-intl"
import { useState, useEffect } from "react"
import { PropertyFilters } from "./property-filters"
import { CollapsibleFilterBox } from "./collapsible-filter-box"

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Category {
  id: number
  name: {
    ar: string
    en: string
  }
  parent_id?: number
  children?: Category[]
  level?: number
}

interface Governorate {
  id: number
  name: {
    ar: string
    en: string
  }
}

interface City {
  id: number
  name: {
    ar: string
    en: string
  }
  governorate_id: number
}

interface Property {
  id: number
  name: {
    ar: string
    en: string
  }
}

export function FilterDrawer({ open, onOpenChange }: FilterDrawerProps) {
  const { 
    filters, 
    categories, 
    governorates, 
    cities, 
    availableSubCategories,
    handleCategoryChange,
    handleSubCategoryChange,
    handleSubSubCategoryChange,
    handlePropertyChange,
    handleFeatureToggle,
    handleFilterChange,
    handleApply,
    handleReset
  } = useAdvancedFilters()
  const locale = useLocale() as 'ar' | 'en'

  // Get selected category data
  const selectedMainCategoryData = categories.find(cat => cat.id.toString() === filters.propertyCategory)
  const selectedSubCategoryData = availableSubCategories.find(cat => cat.id.toString() === filters.selectedSubCategory?.id.toString())

  const handleApplyFilters = () => {
    handleApply()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 max-w-lg mx-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">فلترة حسب</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="w-16 h-1 bg-border rounded-full mx-auto mt-2" />
          </SheetHeader>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
              {/* Property Type */}
              <CollapsibleFilterBox 
                title="نوع العقار" 
                defaultExpanded={true}
                badge={filters.propertyType !== 'بيع' ? 1 : 0}
              >
                <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                  <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="بيع">بيع</SelectItem>
                    <SelectItem value="إيجار">إيجار</SelectItem>
                  </SelectContent>
                </Select>
              </CollapsibleFilterBox>

              {/* Category Selection */}
              <CollapsibleFilterBox 
                title="التصنيف" 
                defaultExpanded={true}
                badge={filters.propertyCategory ? 1 : 0}
              >
                <div className="space-y-3">
                  {/* Main Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">التصنيف الرئيسي</Label>
                    <Select value={filters.propertyCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                        <SelectValue placeholder="اختر التصنيف الرئيسي" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name[locale]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sub Category - Only show if main category is selected and subcategories exist */}
                  {filters.propertyCategory && availableSubCategories.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">التصنيف الفرعي</Label>
                      <Select 
                        value={filters.selectedSubCategory?.id.toString() || ''} 
                        onValueChange={handleSubCategoryChange}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                          <SelectValue placeholder="اختر التصنيف الفرعي" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubCategories.map((subCategory) => (
                            <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                              {subCategory.name[locale]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CollapsibleFilterBox>

              {/* Location */}
              <CollapsibleFilterBox 
                title="الموقع" 
                defaultExpanded={true}
                badge={(filters.governorate ? 1 : 0) + (filters.city ? 1 : 0)}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">المحافظة</Label>
                    <Select value={filters.governorate} onValueChange={(value) => {
                      handleFilterChange('governorate', value)
                      handleFilterChange('city', '') // Reset city when governorate changes
                    }}>
                      <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {governorates.map((governorate: any) => (
                          <SelectItem key={governorate.id} value={governorate.id.toString()}>
                            {governorate.name[locale]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Only show city selector if there are cities available */}
                  {cities.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">المدينة</Label>
                      <Select 
                        value={filters.city} 
                        onValueChange={(value) => handleFilterChange('city', value)}
                        disabled={!filters.governorate}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city: any) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                              {city.name[locale]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CollapsibleFilterBox>

              {/* Price Range */}
              <CollapsibleFilterBox 
                title="السعر (شهرياً)" 
                defaultExpanded={false}
                badge={(filters.priceFrom ? 1 : 0) + (filters.priceTo ? 1 : 0)}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">من</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.priceFrom}
                      onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                      className="h-12 rounded-xl bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">إلى</Label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={filters.priceTo}
                      onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                      className="h-12 rounded-xl bg-background border-border"
                    />
                  </div>
                </div>
              </CollapsibleFilterBox>

              {/* Area Range */}
              <CollapsibleFilterBox 
                title="المساحة (م²)" 
                defaultExpanded={false}
                badge={(filters.areaFrom ? 1 : 0) + (filters.areaTo ? 1 : 0)}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">من</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.areaFrom}
                      onChange={(e) => handleFilterChange('areaFrom', e.target.value)}
                      className="h-12 rounded-xl bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">إلى</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={filters.areaTo}
                      onChange={(e) => handleFilterChange('areaTo', e.target.value)}
                      className="h-12 rounded-xl bg-background border-border"
                    />
                  </div>
                </div>
              </CollapsibleFilterBox>

              {/* Additional Filters */}
              <CollapsibleFilterBox 
                title="تفاصيل إضافية" 
                defaultExpanded={false}
                badge={(filters.rooms ? 1 : 0) + (filters.furnished !== 'furnished' ? 1 : 0)}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">عدد الغرف</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={filters.rooms}
                      onChange={(e) => handleFilterChange('rooms', e.target.value)}
                      className="h-12 rounded-xl bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">المفروشات</Label>
                    <Select value={filters.furnished} onValueChange={(value) => handleFilterChange('furnished', value)}>
                      <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furnished">مفروش</SelectItem>
                        <SelectItem value="unfurnished">غير مفروش</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleFilterBox>
            </div>
          </div>

          {/* Advanced Property Filters - Only show if there are properties or features */}
          {(filters.availableProperties.length > 0 || filters.availableFeatures.length > 0) && (
            <div className="px-6 pb-4">
              <CollapsibleFilterBox 
                title="خصائص وميزات العقار" 
                defaultExpanded={false}
                badge={Object.keys(filters.selectedProperties).length + filters.selectedFeatures.length}
              >
                <PropertyFilters
                  properties={filters.availableProperties}
                  features={filters.availableFeatures}
                  selectedProperties={filters.selectedProperties}
                  selectedFeatures={filters.selectedFeatures}
                  onPropertyChange={handlePropertyChange}
                  onFeatureToggle={handleFeatureToggle}
                  onReset={() => {
                    // Reset only property and feature filters
                    Object.keys(filters.selectedProperties).forEach(propertyId => {
                      handlePropertyChange(parseInt(propertyId), '')
                    })
                    filters.selectedFeatures.forEach(featureId => {
                      handleFeatureToggle(featureId)
                    })
                  }}
                />
              </CollapsibleFilterBox>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="p-6 border-t bg-background grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-14 rounded-2xl text-base font-semibold bg-transparent"
            >
              إعادة تعيين
            </Button>
            <Button onClick={handleApplyFilters} className="h-14 rounded-2xl text-base font-semibold">
              تطبيق الفلترة
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
