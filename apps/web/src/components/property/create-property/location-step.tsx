"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PropertyFormData } from "./property-form-engine"

interface Governorate {
  id: number
  name_ar: string
  name_en: string
  cities: City[]
}

interface City {
  id: number
  name_ar: string
  name_en: string
  governorate_id: number
}

interface LocationStepProps {
  data: PropertyFormData
  updateData: (data: Partial<PropertyFormData>) => void
  onNext: () => void
  onPrevious: () => void
  governorates?: Governorate[]
  cities?: City[]
}

export function LocationStep({ data, updateData, onNext, onPrevious, governorates = [], cities = [] }: LocationStepProps) {
  const [mapError, setMapError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.latitude || !data.longitude) {
      setMapError(true)
      return
    }
    onNext()
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Simulate map pin placement
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Mock coordinates
    updateData({
      latitude: 36.2 + (y / rect.height) * 0.1,
      longitude: 37.1 + (x / rect.width) * 0.1,
    })
    setMapError(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Governorate */}
      <div className="space-y-2">
        <Label htmlFor="governorate_id" className="text-right block">
          المحافظة <span className="text-destructive">*</span>
        </Label>
        <Select value={data.governorate_id} onValueChange={(value) => updateData({ governorate_id: value, city_id: "" })}>
          <SelectTrigger id="governorate_id" className="text-right">
            <SelectValue placeholder="اختر المحافظة" />
          </SelectTrigger>
          <SelectContent>
            {governorates.map((governorate) => (
              <SelectItem key={governorate.id} value={governorate.id.toString()}>
                {governorate.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city_id" className="text-right block">
          المدينة <span className="text-destructive">*</span>
        </Label>
        <Select value={data.city_id} onValueChange={(value) => updateData({ city_id: value })} disabled={!data.governorate_id}>
          <SelectTrigger id="city_id" className="text-right">
            <SelectValue placeholder="اختر المدينة" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id.toString()}>
                {city.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Map */}
      <div className="space-y-2">
        <Label className="text-right block">موقع العقار على الخريطة</Label>
        <div
          onClick={handleMapClick}
          className="relative w-full h-64 bg-muted rounded-xl overflow-hidden cursor-crosshair border-2 border-border"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-JJ5Yi845QPxSLlrLaAXvc2rV2zv51s.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {data.latitude && data.longitude && (
            <div
              className="absolute w-8 h-8 -ml-4 -mt-8 transition-all"
              style={{
                left: "50%",
                top: "50%",
              }}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          )}
        </div>
        {mapError && <p className="text-xs text-destructive text-right">ثبت الدبوس على الخريطة</p>}
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
