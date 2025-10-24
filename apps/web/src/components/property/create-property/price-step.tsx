"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PropertyFormData } from "./property-form-engine"

interface PriceStepProps {
  data: PropertyFormData
  updateData: (data: Partial<PropertyFormData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function PriceStep({ data, updateData, onNext, onPrevious }: PriceStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-right block">
          السعر <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          value={data.price}
          onChange={(e) => updateData({ price: e.target.value })}
          placeholder="أدخل السعر (دولار/الشهر)"
          className="text-right border-destructive focus-visible:ring-destructive"
          required
        />
        <p className="text-xs text-destructive text-right">هذا الحقل مطلوب / يجب أن تكون القيمة رقماً</p>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label htmlFor="currency" className="text-right block">
          العملة <span className="text-destructive">*</span>
        </Label>
        <Select value={data.currency} onValueChange={(value) => updateData({ currency: value })}>
          <SelectTrigger id="currency" className="text-right">
            <SelectValue placeholder="اختر العملة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">دولار أمريكي</SelectItem>
            <SelectItem value="EUR">يورو</SelectItem>
            <SelectItem value="GBP">جنيه إسترليني</SelectItem>
            <SelectItem value="SAR">ريال سعودي</SelectItem>
            <SelectItem value="AED">درهم إماراتي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Availability Status */}
      <div className="space-y-2">
        <Label htmlFor="availability_status" className="text-right block">
          حالة التوفر <span className="text-destructive">*</span>
        </Label>
        <Select value={data.availability_status} onValueChange={(value) => updateData({ availability_status: value })}>
          <SelectTrigger id="availability_status" className="text-right">
            <SelectValue placeholder="اختر حالة التوفر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">متاح</SelectItem>
            <SelectItem value="rented">مؤجر</SelectItem>
            <SelectItem value="sold">مباع</SelectItem>
            <SelectItem value="reserved">محجوز</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-right block">
          حالة الإعلان <span className="text-destructive">*</span>
        </Label>
        <Select value={data.status} onValueChange={(value) => updateData({ status: value })}>
          <SelectTrigger id="status" className="text-right">
            <SelectValue placeholder="اختر حالة الإعلان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
            <SelectItem value="pending">في الانتظار</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onPrevious}
          variant="outline"
          className="flex-1 h-12 text-base font-bold rounded-xl bg-transparent"
        >
          السابق
        </Button>
        <Button type="submit" className="flex-1 h-12 text-base font-bold rounded-xl">
          التالي
        </Button>
      </div>
    </form>
  )
}
