"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"
import type { ListingFormData } from "../types"

interface PriceStepProps {
  onNext: () => void
  onPrevious: () => void
  showNavigation?: boolean
}

export function PriceStep({ onNext, onPrevious, showNavigation = true }: PriceStepProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold text-right">
            السعر (بالدولار الأمريكي)
          </Label>
        </div>
        
        <div className="relative">
          <Input
            id="price"
            type="number"
            step="0.01"
            value={watch("price") || ""}
            onChange={(e) => setValue("price", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="text-right text-lg h-14 pl-8"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </div>
        </div>
        {errors.price && (
          <p className="text-xs text-destructive text-right">{errors.price.message}</p>
        )}
      </div>

      {/* Payment Frequency - Only for Rent */}
      {watch("type") === "rent" && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-right block">
            دورية الدفع (للإيجار)
          </Label>
          
          <div className="space-y-3">
            {[
              { value: "monthly", label: "شهرياً" },
              { value: "quarterly", label: "كل 3 أشهر" },
              { value: "semi_annually", label: "كل 6 أشهر" },
              { value: "annually", label: "سنوياً" }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id={`payment_frequency_${option.value}`}
                  value={option.value}
                  checked={watch("payment_frequency") === option.value}
                  onChange={(e) => setValue("payment_frequency", e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <Label 
                  htmlFor={`payment_frequency_${option.value}`} 
                  className="cursor-pointer text-sm flex-1"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insurance - Optional */}
      <div className="space-y-2">
        <Label htmlFor="insurance" className="text-right block">
          التأمين (اختياري)
        </Label>
        <div className="relative">
          <Input
            id="insurance"
            type="number"
            step="0.01"
            value={watch("insurance") || ""}
            onChange={(e) => setValue("insurance", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="text-right text-lg h-14 pl-8"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Only show if navigation is enabled */}
      {showNavigation && (
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onPrevious}
            variant="outline"
            className="flex-1 h-12 text-base font-bold rounded-xl bg-transparent"
          >
            السابق
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 text-base font-bold rounded-xl"
          >
            التالي
          </Button>
        </div>
      )}
    </form>
  )
}

