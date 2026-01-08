"use client"

import * as React from "react"
import { useFormContext, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useLocale, useTranslations } from "next-intl"
import type { ListingFormData, Category, Property, Feature } from "../types"
import Image from "next/image"

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
  showNavigation?: boolean
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
  onSubSubCategoryChange,
  showNavigation = true
}: BasicInfoStepProps) {
  const { register, watch, setValue, control, formState: { errors } } = useFormContext<ListingFormData>()
  const locale = useLocale() as "ar" | "en"
  const t = useTranslations('listingForm.basicInfo')

  function Option({ className, classNameSub, text, onClick }: { className: string, classNameSub: any, text: string, onClick: () => void }) {
    return (
      <div
        className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${className}`}
        onClick={onClick}
      >
        <div className="text-center flex flex-row gap-2 sm:gap-4 items-center justify-start">
          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-2xl rounded-full border-primary border-2 sm:border-3 text-white p-1.5 sm:p-2 shrink-0 ${classNameSub}`}> </div>
          <div className="flex flex-col items-center justify-center">
            <div className="font-semibold text-primary text-sm sm:text-base">{text}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title Arabic */}

      <div className="space-y-2">
        <Label htmlFor="title_ar" className="text-start block text-sm sm:text-base">
          {t('title')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title[ar]"
          {...register("title.ar", { required: t('titleRequired') })}
          placeholder={t('titlePlaceholder')}
          className="text-start h-10 sm:h-11"
        />
        {errors.title?.ar && (
          <p className="text-xs text-destructive text-start">{errors.title.ar.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description_ar" className="text-start block text-sm sm:text-base">
          {t('description')}
        </Label>
        <textarea
          id="description[ar]"
          {...register("description.ar")}
          placeholder={t('descriptionPlaceholder')}
          className="w-full p-2.5 sm:p-3 border border-input rounded-md text-start resize-none text-sm sm:text-base"
          rows={3}
        />
      </div>

      {/* Main Category */}
      <div className="space-y-2">
        <Label htmlFor="main_category" className="text-start block">
          {t('mainCategory')} <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <Select
              dir="rtl"
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(value)
                onCategoryChange?.(value)
              }}
            >
              <SelectTrigger id="main_category" className="text-start">
                <SelectValue placeholder={t('selectMainCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex flex-row gap-2 items-center justify-start">
                      {(category as any)?.icon && (
                        <Image src={(category as any)?.icon} alt={category.name[locale]} width={20} height={20} />
                      )} 
                      <span className="text-sm">{category.name[locale]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category_id && (
          <p className="text-xs text-destructive text-start">{errors.category_id.message}</p>
        )}
      </div>

      {/* Sub Category */}
      {subCategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="sub_category" className="text-start block">
            {t('subCategory')}
          </Label>
          <Controller
            name="sub_category_id"
            control={control}
            render={({ field }) => (
              <Select
                dir="rtl"
                value={field.value || ""}
                onValueChange={(value) => {
                  field.onChange(value)
                  onSubCategoryChange?.(value)
                }}
              >
                <SelectTrigger id="sub_category" className="text-start">
                  <SelectValue placeholder={t('selectSubCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex flex-row gap-2 items-center justify-start">
                        {(category as any)?.icon && (
                          <Image src={(category as any)?.icon} alt={category.name[locale]} width={20} height={20} />
                        )} 
                        <span className="text-sm">{category.name[locale]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      {/* Sub-Sub Category */}
      {subSubCategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="sub_sub_category" className="text-start block">
            {t('subSubCategory')}
          </Label>
          <Controller
            name="sub_sub_category_id"
            control={control}
            render={({ field }) => (
              <Select
                dir="rtl"
                value={field.value || ""}
                onValueChange={(value) => {
                  field.onChange(value)
                  onSubSubCategoryChange?.(value)
                }}
              >
                <SelectTrigger id="sub_sub_category" className="text-start">
                  <SelectValue placeholder={t('selectSubSubCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {subSubCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}


      {/* Property Type - Group Select */}
      <div className="space-y-2">
        <Label className="text-start block text-base sm:text-lg font-semibold">
          {t('propertyType')} <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Option
            className={watch("type") === "sale" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("type") === "sale" && "bg-primary"}
            text={t('sale')}
            onClick={() => setValue("type", "sale")}
          />
          <Option
            className={watch("type") === "rent" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("type") === "rent" && "bg-primary"}
            text={t('rent')}
            onClick={() => setValue("type", "rent")}
          />
        </div>
        {errors.type && (
          <p className="text-xs text-destructive text-start">{errors.type.message}</p>
        )}
      </div>

      {/* Availability Status - Group Select */}
      <div className="space-y-2">
        <Label className="text-start block text-base sm:text-lg font-semibold">
          {t('availabilityStatus')} <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Option
            className={watch("availability_status") === "available" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("availability_status") === "available" && "bg-primary"}
            text={t('available')}
            onClick={() => setValue("availability_status", "available")}
          />
          <Option
            className={watch("availability_status") === "unavailable" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("availability_status") === "unavailable" && "bg-primary"}
            text={t('unavailable')}
            onClick={() => setValue("availability_status", "unavailable")}
          />
          <Option
              className={watch("availability_status") === "rented" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("availability_status") === "rented" && "bg-primary"}
            text={t('rented')}
            onClick={() => setValue("availability_status", "rented")}
          />
          <Option
            className={watch("availability_status") === "solded" ? "border-primary bg-primary/5" : "border-gray-200"}
            classNameSub={watch("availability_status") === "solded" && "bg-primary"}
            text={t('solded')}
            onClick={() => setValue("availability_status", "solded")}
          />
        </div>
        {errors.availability_status && (
          <p className="text-xs text-destructive text-start">{errors.availability_status.message}</p>
        )}
      </div>

      {/* Properties */}
      {availableProperties.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-start block text-base sm:text-lg font-semibold">
            {t('properties')}
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {availableProperties.map((property) => {
              return (
                <div key={property.id} className="space-y-2">
                  <Label htmlFor={`property_${property.id}`} className="text-start block">
                    {property.name[locale]}
                  </Label>
                  {((property.type === 'text' || property.type === 'string') && property.options === null) && (
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
                      placeholder={t('enterProperty', { property: property.name[locale] })}
                      className="text-start"
                    />
                  )}
                  {((property.type === 'number' || property.type === 'int' || property.type === 'float') && property.options === null) && (
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
                      placeholder={t('enterProperty', { property: property.name[locale] })}
                      className="text-start"
                    />
                  )}
                  {(property.type === 'select' || property.type === "bool" || property.options !== null) && (
                    <Select
                      dir="rtl"
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
                      <SelectTrigger className="text-start">
                        <SelectValue placeholder={t('selectProperty', { property: property.name[locale] })} />
                      </SelectTrigger>
                      <SelectContent>
                        {property.options && property.options.length > 0 ? (
                          property.options.map((option, index) => (
                            <SelectItem key={index} value={option[locale]}>
                              {option[locale]}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="yes">{t('yes')}</SelectItem>
                            <SelectItem value="no">{t('no')}</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )
            }
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {availableFeatures.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-start block text-base sm:text-lg font-semibold">
            {t('features')}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {availableFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2 gap-4 space-x-reverse p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={`feature_${feature.id}`}
                  checked={watch("features")?.includes(feature.id.toString()) || false}
                  onCheckedChange={(checked) => {
                    const newFeatures = [...(watch("features") || [])]
                    if (checked) {
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
                />
                <Label htmlFor={`feature_${feature.id}`} className="cursor-pointer text-sm flex-1">
                    {(feature as any)?.icon && (
                      <Image src={(feature as any)?.icon} alt={feature.name[locale]} width={20} height={20} />
                    )}  
                  {feature.name[locale]}
                  {feature.description && (
                    <span className="block text-xs text-gray-500 mt-1">
                      {feature.description[locale]}
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button - Only show if navigation is enabled */}
      {showNavigation && (
        <Button type="button" onClick={onNext} className="w-full h-12 text-base font-bold rounded-xl">
          {t('next')}
        </Button>
      )}
    </div>
  )
}
