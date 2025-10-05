"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PropertyFormData } from "../create-property-form"

interface BasicInfoStepProps {
  data: PropertyFormData
  updateData: (data: Partial<PropertyFormData>) => void
  onNext: () => void
}

export function BasicInfoStep({ data, updateData, onNext }: BasicInfoStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-right block">
          العنوان <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="اكتب عنواناً واضحاً"
          className="text-right"
          required
        />
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label htmlFor="propertyType" className="text-right block">
          نوع العقار <span className="text-destructive">*</span>
        </Label>
        <Select value={data.propertyType} onValueChange={(value) => updateData({ propertyType: value })}>
          <SelectTrigger id="propertyType" className="text-right">
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

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-right block">
          التصنيف <span className="text-destructive">*</span>
        </Label>
        <Select value={data.category} onValueChange={(value) => updateData({ category: value })}>
          <SelectTrigger id="category" className="text-right">
            <SelectValue placeholder="اختر من القائمة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rent">للإيجار</SelectItem>
            <SelectItem value="sale">للبيع</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {/* Submit Button */}
      <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl">
        التالي
      </Button>
    </form>
  )
}
