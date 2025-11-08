"use client"

import { useState, useCallback } from "react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Navigation } from "lucide-react"

interface LocationPickerMapProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  onClose: () => void
  showControls?: boolean // إظهار أدوات التحكم
}

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem"
}

const GOOGLE_MAPS_LIBRARIES = ["places", "maps"] as any

// Helper function to validate and sanitize coordinates
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

export function LocationPickerMap({
  initialLat = 34.8021,
  initialLng = 36.7570,
  onLocationSelect,
  onClose,
  showControls = true
}: LocationPickerMapProps) {
  // Validate and sanitize initial coordinates
  const validatedCoords = validateCoordinates(initialLat, initialLng)

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    address?: string
  }>({
    lat: validatedCoords.lat,
    lng: validatedCoords.lng
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES
  })

  const handleMapClick = useCallback((event: any) => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()

    setSelectedLocation({ lat, lng })

    // استخراج الإحداثيات تلقائياً
    onLocationSelect(lat, lng)

    // Get address using reverse geocoding
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address
          setSelectedLocation(prev => ({ ...prev, address }))
          // إرسال العنوان أيضاً
          onLocationSelect(lat, lng, address)
        }
      })
    }
  }, [onLocationSelect])

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !window.google || !window.google.maps) return

    setIsSearching(true)
    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false)

      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()
        const address = results[0].formatted_address

        setSelectedLocation({ lat, lng, address })
        // استخراج الإحداثيات تلقائياً
        onLocationSelect(lat, lng, address)
      } else {
      }
    })
  }, [searchQuery, onLocationSelect])

  const handleConfirm = () => {
    onLocationSelect(selectedLocation.lat, selectedLocation.lng, selectedLocation.address)
    onClose()
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setSelectedLocation({ lat, lng })
        // استخراج الإحداثيات تلقائياً
        onLocationSelect(lat, lng)

        // Get address using reverse geocoding
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address
              setSelectedLocation(prev => ({ ...prev, address }))
              // إرسال العنوان أيضاً
              onLocationSelect(lat, lng, address)
            }
          })
        }
      },
      (error) => {
      }
    )
  }

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">خطأ في تحميل الخريطة</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن عنوان أو مكان..."
            className="text-right flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            variant="outline"
            size="icon"
          >
            <Search className="h-4 w-4" />
          </Button> */}
          <Button
            type="button"
            onClick={handleGetCurrentLocation}
            variant="outline"
            // size="icon"
            title="الموقع الحالي"
          >
            <Navigation className="h-4 w-4" />
            <span className="text-right">الموقع الحالي</span>
          </Button>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          zoom={15}
          onClick={handleMapClick}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: true,
            zoomControl: true,
            gestureHandling: "greedy"
          }}
        >
          <Marker
            position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="32" height="40" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.2861 8.90722C9.80561 8.9066 9.3361 8.76351 8.93694 8.49605C8.53778 8.22859 8.22689 7.84877 8.04359 7.40462C7.86029 6.96047 7.81281 6.47194 7.90716 6.00081C8.00151 5.52968 8.23344 5.09711 8.57364 4.75779C8.91383 4.41848 9.347 4.18766 9.81838 4.09453C10.2898 4.0014 10.7782 4.05014 11.2218 4.23459C11.6655 4.41904 12.0445 4.73091 12.3109 5.13076C12.5774 5.53062 12.7192 6.0005 12.7186 6.48098C12.7165 7.12488 12.4593 7.7417 12.0034 8.19642C11.5475 8.65114 10.93 8.90672 10.2861 8.90722ZM10.2861 4.9913C9.99147 4.9913 9.70345 5.07867 9.45847 5.24236C9.2135 5.40604 9.02256 5.6387 8.90981 5.91091C8.79706 6.18311 8.76756 6.48264 8.82504 6.77161C8.88252 7.06058 9.0244 7.32601 9.23273 7.53435C9.44107 7.74269 9.70651 7.88456 9.99548 7.94204C10.2844 7.99952 10.584 7.97002 10.8562 7.85727C11.1284 7.74452 11.361 7.55358 11.5247 7.30861C11.6884 7.06363 11.7758 6.77561 11.7758 6.48098C11.775 6.08615 11.6177 5.70772 11.3385 5.42853C11.0594 5.14934 10.6809 4.99213 10.2861 4.9913Z" fill="#FF5A5F" />
                  <path d="M10.2858 14.3065C9.31742 14.3046 8.38731 13.9285 7.68981 13.2568C5.83744 11.4717 3.78646 8.6243 4.55958 5.23637C4.85437 3.94799 5.58548 2.80114 6.62906 1.99011C7.67263 1.17908 8.96448 0.753748 10.2858 0.786173H10.292C11.6145 0.753496 12.9076 1.17948 13.9517 1.9918C14.9958 2.80412 15.7266 3.95274 16.0201 5.24265C16.7869 8.63059 14.7378 11.4717 12.8836 13.2568C12.1856 13.9289 11.2547 14.305 10.2858 14.3065ZM10.2858 1.72901C9.17743 1.68971 8.09032 2.03972 7.21312 2.71829C6.33592 3.39686 5.724 4.36115 5.48356 5.44379C4.80472 8.40431 6.66525 10.9563 8.34979 12.5716C8.86907 13.0764 9.56471 13.3588 10.2889 13.3588C11.0131 13.3588 11.7087 13.0764 12.228 12.5716C13.9063 10.9563 15.7668 8.40431 15.1005 5.44379C14.8566 4.36059 14.242 3.3966 13.3629 2.71835C12.4838 2.04009 11.3954 1.69016 10.2858 1.72901Z" fill="#FF5A5F" />
                  <ellipse opacity="0.51" cx="10.2855" cy="16.2066" rx="9.92225" ry="5.79334" fill="#FF5A5F" />
                  <ellipse opacity="0.43" cx="10.2856" cy="16.2066" rx="4.5795" ry="2.70356" fill="#FF5A5F" />
                </svg>
              `)}`,
              scaledSize: new (window as any).google.maps.Size(32, 40),
              anchor: new (window as any).google.maps.Point(16, 40)
            }}
          />
        </GoogleMap>

        {/* Instructions */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600">
          انقر على الخريطة لاختيار الموقع
        </div>
      </div>
    </div>
  )
}
