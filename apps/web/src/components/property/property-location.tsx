import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import { PinIcon } from "../icons/pin"

interface PropertyLocationProps {
  location?: string
  latitude?: string
  longitude?: string
  locale?: string
}

export function PropertyLocation({ location, latitude, longitude, locale = 'ar' }: PropertyLocationProps) {
  const hasCoordinates = latitude && longitude && latitude !== '0' && longitude !== '0'

  const handleOpenMaps = () => {
    if (hasCoordinates) {
      // Open in Google Maps
      const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
      window.open(googleMapsUrl, '_blank')
    }
  }

  const handleGetDirections = () => {
    if (hasCoordinates) {
      // Open directions in Google Maps
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      window.open(directionsUrl, '_blank')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">
        {locale === 'ar' ? 'الموقع' : 'Location'}
      </h2>

      {/* Location Text */}
      {location && (
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <div className="bg-primary/10 h-10 w-10 rounded-full flex justify-center items-center">
            <PinIcon className="h-5 w-5 flex-shrink-0 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-foreground">{location}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {locale === 'ar' ? 'موقع العقار' : 'Property location'}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative h-64 rounded-3xl overflow-hidden border border-border bg-muted/30">
        {hasCoordinates ? (
          <>
            {/* Static Map Placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'خريطة تفاعلية' : 'Interactive Map'}
                </p>
              </div>
            </div>

            {/* Map Pin Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-primary-foreground fill-current" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
              </div>
            </div>

            {/* Map Actions */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <Button
                onClick={handleOpenMaps}
                size="sm"
                variant="secondary"
                className="flex-1 h-10 bg-white/95 hover:bg-white text-foreground shadow-md"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {locale === 'ar' ? 'عرض الخريطة' : 'View Map'}
              </Button>
              <Button
                onClick={handleGetDirections}
                size="sm"
                variant="secondary"
                className="flex-1 h-10 bg-white/95 hover:bg-white text-foreground shadow-md"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {locale === 'ar' ? 'الاتجاهات' : 'Directions'}
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {locale === 'ar' ? 'لا توجد إحداثيات متاحة' : 'No coordinates available'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates Display */}
      {hasCoordinates && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <span className="font-mono">
            {locale === 'ar' ? 'الإحداثيات:' : 'Coordinates:'} {latitude}, {longitude}
          </span>
        </div>
      )}
    </div>
  )
}
