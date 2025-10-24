"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Map } from "lucide-react"
import { LocationPickerMap } from "../components/location-picker-map"
import type { ListingFormData, Governorate, City } from "../types"

interface LocationStepProps {
  onNext: () => void
  onPrevious: () => void
  governorates?: Governorate[]
  cities?: City[]
}

export function LocationStep({
  onNext,
  onPrevious,
  governorates = [],
  cities = []
}: LocationStepProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    console.log("📍 Location selected:", { lat, lng, address })
    setValue("latitude", lat)
    setValue("longitude", lng)
    if (address) {
      setSelectedAddress(address)
    }
    setIsMapOpen(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Governorate */}
      <div className="space-y-2">
        <Label htmlFor="governorate_id" className="text-right block">
          المحافظة <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("governorate_id")}
          onValueChange={(value) => setValue("governorate_id", value)}
        >
          <SelectTrigger id="governorate_id" className="text-right">
            <SelectValue placeholder="اختر المحافظة" />
          </SelectTrigger>
          <SelectContent>
            {governorates.map((governorate) => (
              <SelectItem key={governorate.id} value={governorate.id.toString()}>
                {governorate.name["ar"]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.governorate_id && (
          <p className="text-xs text-destructive text-right">{errors.governorate_id.message}</p>
        )}
      </div>

      {/* City - Optional */}
      <div className="space-y-2">
        <Label htmlFor="city_id" className="text-right block">
          المدينة (اختياري)
        </Label>
        <Select
          value={watch("city_id")}
          onValueChange={(value) => setValue("city_id", value)}
          disabled={!watch("governorate_id")}
        >
          <SelectTrigger id="city_id" className="text-right">
            <SelectValue placeholder="اختر المدينة (اختياري)" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id.toString()}>
                {city.name["ar"]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.city_id && (
          <p className="text-xs text-destructive text-right">{errors.city_id.message}</p>
        )}
      </div>

      {/* Interactive Map */}
      <div className="space-y-4">
        {/* Map Container */}
        <div className="  overflow-hidden">
          <LocationPickerMap
            initialLat={watch("latitude") || 31.2001}
            initialLng={watch("longitude") || 29.9187}
            onLocationSelect={handleLocationSelect}
            onClose={() => { }} // لا نحتاج إغلاق لأنها ليست popup
            showControls={true} // إظهار أدوات التحكم
          />
        </div>
      </div>

      {/* Navigation Buttons */}
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
    </form>
  )
}
