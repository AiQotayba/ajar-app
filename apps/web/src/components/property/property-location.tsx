import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import { PinIcon } from "../icons/pin"
import { PropertyMap } from "./map/property-map"

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
            {hasCoordinates ? (
                <div className="space-y-3">
                    <PropertyMap
                        lat={parseFloat(latitude!)}
                        lng={parseFloat(longitude!)}
                        zoom={15}
                    />

                    {/* Map Actions */}
                    <div className="flex gap-2">
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
                </div>
            ) : (
                <div className="relative h-64 rounded-3xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            {locale === 'ar' ? 'لا توجد إحداثيات متاحة' : 'No coordinates available'}
                        </p>
                    </div>
                </div>
            )}

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
