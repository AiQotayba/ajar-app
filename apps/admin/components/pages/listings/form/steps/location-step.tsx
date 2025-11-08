"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationPickerMap } from "../components/location-picker-map"
import type { ListingFormData, Governorate, City } from "../types"

interface LocationStepProps {
  onNext: () => void
  onPrevious: () => void
  governorates?: Governorate[]
  cities?: City[]
  onLocationSelect?: (lat: number, lng: number, address?: string) => void
  isLocationSelected?: boolean
  showNavigation?: boolean
}

export function LocationStep({
  onNext,
  onPrevious,
  governorates = [],
  cities = [],
  onLocationSelect,
  isLocationSelected = false,
  showNavigation = true
}: LocationStepProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()
  const [selectedAddress, setSelectedAddress] = useState("")

  // Helper function to validate coordinates
  const validateCoordinates = (lat: any, lng: any): { lat: number; lng: number } => {
    const defaultLat = 34.8021 // Homs, Syria
    const defaultLng = 36.7570

    // Convert to numbers and validate
    const numLat = typeof lat === 'number' ? lat : parseFloat(lat)
    const numLng = typeof lng === 'number' ? lng : parseFloat(lng)

    // Check if coordinates are valid numbers and within valid ranges
    const isValidLat = !isNaN(numLat) && numLat >= -90 && numLat <= 90
    const isValidLng = !isNaN(numLng) && numLng >= -180 && numLng <= 180

    return {
      lat: isValidLat ? numLat : defaultLat,
      lng: isValidLng ? numLng : defaultLng
    }
  }

  // Set default location to Syria if not set or invalid
  const currentLat = watch("latitude")
  const currentLng = watch("longitude")
  const validatedCoords = validateCoordinates(currentLat, currentLng)

  // Update form values if coordinates are invalid
  if (currentLat !== validatedCoords.lat || currentLng !== validatedCoords.lng) {
    setValue("latitude", validatedCoords.lat)
    setValue("longitude", validatedCoords.lng)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const handleLocationSelectInternal = (lat: number, lng: number, address?: string) => {
    setValue("latitude", lat)
    setValue("longitude", lng)
    if (address) {
      setSelectedAddress(address)
    }

    // Call parent handler if provided
    if (onLocationSelect) {
      onLocationSelect(lat, lng, address)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Governorate */}
      <div className="space-y-2">
        <Label htmlFor="governorate_id" className="text-right block text-sm sm:text-base">
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
        <Label htmlFor="city_id" className="text-right block text-sm sm:text-base">
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
      <div className="space-y-3 sm:space-y-4">
        <Label className="text-right block text-sm sm:text-base">
          الموقع على الخريطة <span className="text-destructive">*</span>
        </Label>
        {/* Map Container */}
        <div className="w-full overflow-hidden rounded-lg">
          <LocationPickerMap
            initialLat={validatedCoords.lat}
            initialLng={validatedCoords.lng}
            onLocationSelect={handleLocationSelectInternal}
            onClose={() => { }}
            showControls={true}
          />
        </div>
        {errors.latitude && (
          <p className="text-xs text-destructive text-right">{errors.latitude.message}</p>
        )}
        {selectedAddress && (
          <p className="text-sm text-muted-foreground text-right">
            العنوان المحدد: {selectedAddress}
          </p>
        )}
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

