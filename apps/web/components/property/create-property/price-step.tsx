"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PropertyFormData } from "../create-property-form"

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

      {/* Payment Frequency */}
      <div className="space-y-2">
        <Label htmlFor="paymentFrequency" className="text-right block">
          دورية الدفع <span className="text-destructive">*</span>
        </Label>
        <Select value={data.paymentFrequency} onValueChange={(value) => updateData({ paymentFrequency: value })}>
          <SelectTrigger id="paymentFrequency" className="text-right">
            <SelectValue placeholder="اختر كل كم تدفع الأجرة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">يومي</SelectItem>
            <SelectItem value="weekly">أسبوعي</SelectItem>
            <SelectItem value="monthly">شهري</SelectItem>
            <SelectItem value="quarterly">ربع سنوي</SelectItem>
            <SelectItem value="yearly">سنوي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insurance (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="insurance" className="text-right block">
          التأمين (اختياري)
        </Label>
        <Input
          id="insurance"
          type="number"
          value={data.insurance}
          onChange={(e) => updateData({ insurance: e.target.value })}
          placeholder="أدخل القيمة بالدولار"
          className="text-right"
        />
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
