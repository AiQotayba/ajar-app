import { MapPin } from "lucide-react"

interface Location {
  address: string
  neighborhood: string
  lat: number
  lng: number
}

interface PropertyLocationProps {
  location: Location
}

export function PropertyLocation({ location }: PropertyLocationProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-foreground">موقع العقار</h2>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <div>{location.address}</div>
          <div>{location.neighborhood}</div>
        </div>
      </div>

      {/* Embedded Map */}
      <div className="relative h-64 rounded-3xl overflow-hidden border border-border">
        <img
          src="/images/design-mode/map-of-aleppo-syria.jpg"
          alt="Property location map"
          className="w-full h-full object-cover"
        />
        {/* Map Pin Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <MapPin className="h-6 w-6 text-primary-foreground fill-current" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
          </div>
        </div>
      </div>
    </div>
  )
}
