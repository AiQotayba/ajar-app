"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation, Loader } from "lucide-react"
import { toast } from "sonner"

// Google Maps type declarations
declare global {
  interface Window {
    google: {
      maps: {
        importLibrary: (library: string) => Promise<any>
        Map: new (element: HTMLElement, options?: any) => any
        Marker: new (options?: any) => any
        Size: new (width: number, height: number) => any
        Point: new (x: number, y: number) => any
        LatLng: new (lat: number, lng: number) => any
        Geocoder: new () => {
          geocode: (request: any, callback: (results: any[] | null, status: string) => void) => void
        }
        MapsLibrary: any
        MarkerLibrary: any
        MapMouseEvent: {
          latLng: {
            lat: () => number
            lng: () => number
          } | null
        }
        GeocoderResult: {
          formatted_address: string
          geometry: {
            location: {
              lat: () => number
              lng: () => number
            }
          }
        }
        GeocoderStatus: string
      }
    }
  }
}

interface LocationPickerMapProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  onClose: () => void
  showControls?: boolean
  height?: string
}

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

// Load Google Maps script
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export function LocationPickerMap({
  initialLat = 34.8021,
  initialLng = 36.7570,
  onLocationSelect,
  onClose,
  showControls = true,
  height = "400px"
}: LocationPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const isUserInteractionRef = useRef(false) // Track if change is from user interaction

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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
        if (!apiKey) {
          throw new Error("Google Maps API key is not configured")
        }

        // Load Google Maps script
        await loadGoogleMapsScript(apiKey)

        // Wait for google.maps to be available
        if (!window.google || !window.google.maps) {
          throw new Error("Google Maps API failed to load")
        }

        // Import libraries using new API
        const { Map } = (await window.google.maps.importLibrary("maps")) as any
        const { Marker } = (await window.google.maps.importLibrary("marker")) as any

        // Create the map
        const initialPosition = { lat: validatedCoords.lat, lng: validatedCoords.lng }
        const mapInstance = new Map(mapRef.current, {
          center: initialPosition,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: "greedy",
        })

        // Create custom marker icon
        const markerIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="40" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.2861 8.90722C9.80561 8.9066 9.3361 8.76351 8.93694 8.49605C8.53778 8.22859 8.22689 7.84877 8.04359 7.40462C7.86029 6.96047 7.81281 6.47194 7.90716 6.00081C8.00151 5.52968 8.23344 5.09711 8.57364 4.75779C8.91383 4.41848 9.347 4.18766 9.81838 4.09453C10.2898 4.0014 10.7782 4.05014 11.2218 4.23459C11.6655 4.41904 12.0445 4.73091 12.3109 5.13076C12.5774 5.53062 12.7192 6.0005 12.7186 6.48098C12.7165 7.12488 12.4593 7.7417 12.0034 8.19642C11.5475 8.65114 10.93 8.90672 10.2861 8.90722ZM10.2861 4.9913C9.99147 4.9913 9.70345 5.07867 9.45847 5.24236C9.2135 5.40604 9.02256 5.6387 8.90981 5.91091C8.79706 6.18311 8.76756 6.48264 8.82504 6.77161C8.88252 7.06058 9.0244 7.32601 9.23273 7.53435C9.44107 7.74269 9.70651 7.88456 9.99548 7.94204C10.2844 7.99952 10.584 7.97002 10.8562 7.85727C11.1284 7.74452 11.361 7.55358 11.5247 7.30861C11.6884 7.06363 11.7758 6.77561 11.7758 6.48098C11.775 6.08615 11.6177 5.70772 11.3385 5.42853C11.0594 5.14934 10.6809 4.99213 10.2861 4.9913Z" fill="#FF5A5F" />
              <path d="M10.2858 14.3065C9.31742 14.3046 8.38731 13.9285 7.68981 13.2568C5.83744 11.4717 3.78646 8.6243 4.55958 5.23637C4.85437 3.94799 5.58548 2.80114 6.62906 1.99011C7.67263 1.17908 8.96448 0.753748 10.2858 0.786173H10.292C11.6145 0.753496 12.9076 1.17948 13.9517 1.9918C14.9958 2.80412 15.7266 3.95274 16.0201 5.24265C16.7869 8.63059 14.7378 11.4717 12.8836 13.2568C12.1856 13.9289 11.2547 14.305 10.2858 14.3065ZM10.2858 1.72901C9.17743 1.68971 8.09032 2.03972 7.21312 2.71829C6.33592 3.39686 5.724 4.36115 5.48356 5.44379C4.80472 8.40431 6.66525 10.9563 8.34979 12.5716C8.86907 13.0764 9.56471 13.3588 10.2889 13.3588C11.0131 13.3588 11.7087 13.0764 12.228 12.5716C13.9063 10.9563 15.7668 8.40431 15.1005 5.44379C14.8566 4.36059 14.242 3.3966 13.3629 2.71835C12.4838 2.04009 11.3954 1.69016 10.2858 1.72901Z" fill="#FF5A5F" />
              <ellipse opacity="0.51" cx="10.2855" cy="16.2066" rx="9.92225" ry="5.79334" fill="#FF5A5F" />
              <ellipse opacity="0.43" cx="10.2856" cy="16.2066" rx="4.5795" ry="2.70356" fill="#FF5A5F" />
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(32, 40),
          anchor: new window.google.maps.Point(16, 40)
        }

        // Create the marker
        const markerInstance = new Marker({
          position: initialPosition,
          map: mapInstance,
          draggable: true,
          title: "موقع العقار",
          icon: markerIcon,
        })

        // Handle marker drag end
        markerInstance.addListener("dragend", async () => {
          const position = markerInstance.getPosition()
          if (position) {
            const lat = position.lat()
            const lng = position.lng()

            // Mark as user interaction to prevent unnecessary updates
            isUserInteractionRef.current = true
            setSelectedLocation({ lat, lng })

            // Get address using reverse geocoding
            await getAddressFromCoordinates(lat, lng)

            // Reset flag after a short delay
            setTimeout(() => {
              isUserInteractionRef.current = false
            }, 100)
          }
        })

        // Handle map click
        mapInstance.addListener("click", async (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            const position = { lat, lng }

            // Mark as user interaction to prevent unnecessary updates
            isUserInteractionRef.current = true
            markerInstance.setPosition(position)
            setSelectedLocation({ lat, lng })

            // Get address using reverse geocoding
            await getAddressFromCoordinates(lat, lng)

            // Reset flag after a short delay
            setTimeout(() => {
              isUserInteractionRef.current = false
            }, 100)
          }
        })

        setMap(mapInstance)
        setMarker(markerInstance)
        setIsLoading(false)

        // Get initial address
        await getAddressFromCoordinates(validatedCoords.lat, validatedCoords.lng)
      } catch (error: any) {
        console.error("❌ Error loading map:", error)
        setLoadError(error.message || "فشل تحميل الخريطة")
        setIsLoading(false)
      }
    }

    initMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Initialize only once on mount

  // Update marker position when coordinates change externally (not from user interaction)
  useEffect(() => {
    if (marker && map && !isUserInteractionRef.current) {
      const currentPos = marker.getPosition()
      if (currentPos) {
        const currentLat = currentPos.lat()
        const currentLng = currentPos.lng()

        // Only update if coordinates actually changed
        if (Math.abs(currentLat - selectedLocation.lat) > 0.0001 ||
          Math.abs(currentLng - selectedLocation.lng) > 0.0001) {
          const newPosition = new window.google.maps.LatLng(selectedLocation.lat, selectedLocation.lng)
          marker.setPosition(newPosition)
          map.panTo(newPosition)
        }
      }
    }
  }, [selectedLocation.lat, selectedLocation.lng, marker, map])

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return

    try {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results: any[] | null, status: string) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address
          setSelectedLocation(prev => ({ ...prev, address }))
          onLocationSelect(lat, lng, address)
        } else {
          // Still call onLocationSelect even if geocoding fails
          onLocationSelect(lat, lng)
        }
      })
    } catch (error) {
      console.error("❌ Geocoding error:", error)
      onLocationSelect(lat, lng)
    }
  }, [onLocationSelect])

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !window.google || !window.google.maps) {
      toast.error("يرجى إدخال عنوان للبحث")
      return
    }

    setIsSearching(true)
    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ address: searchQuery }, (results: any[] | null, status: string) => {
      setIsSearching(false)

      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()
        const address = results[0].formatted_address

        // Mark as user interaction (search) to prevent unnecessary updates
        isUserInteractionRef.current = true
        setSelectedLocation({ lat, lng, address })

        // Update marker position
        if (marker) {
          marker.setPosition({ lat, lng })
        }
        if (map) {
          map.panTo({ lat, lng })
        }

        onLocationSelect(lat, lng, address)
        toast.success("تم العثور على الموقع")

        // Reset flag after a short delay
        setTimeout(() => {
          isUserInteractionRef.current = false
        }, 100)
      } else {
        console.error("❌ Geocoding failed:", status)
        toast.error("لم يتم العثور على الموقع. يرجى المحاولة مرة أخرى")
      }
    })
  }, [searchQuery, onLocationSelect, marker, map])

  // Handle get current location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع")
      return
    }

    toast.info("جاري تحديد موقعك...")
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Mark as user interaction to prevent unnecessary updates
        isUserInteractionRef.current = true
        setSelectedLocation({ lat, lng })

        // Update marker position
        if (marker) {
          marker.setPosition({ lat, lng })
        }
        if (map) {
          map.panTo({ lat, lng })
        }

        // Get address using reverse geocoding
        await getAddressFromCoordinates(lat, lng)
        toast.success("تم تحديد موقعك بنجاح")

        // Reset flag after a short delay
        setTimeout(() => {
          isUserInteractionRef.current = false
        }, 100)
      },
      (error) => {
        console.error("❌ Geolocation error:", error)
        toast.error("فشل تحديد موقعك. يرجى المحاولة مرة أخرى")
      }
    )
  }, [marker, map, getAddressFromCoordinates])

  // Error state
  if (loadError) {
    return (
      <div className="w-full bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="space-y-2">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="ابحث عن عنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="flex-1"
              disabled={isSearching || isLoading}
            />
            <Button
              type="button"
              onClick={handleSearch}
              variant="outline"
              disabled={isSearching || isLoading || !searchQuery.trim()}
            >
              <Search className="h-4 w-4 ml-2" />
              {isSearching ? "جاري البحث..." : "بحث"}
            </Button>
            <Button
              type="button"
              onClick={handleGetCurrentLocation}
              variant="outline"
              title="الموقع الحالي"
              disabled={isLoading}
            >
              <Navigation className="h-4 w-4 ml-2" />
              الموقع الحالي
            </Button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="relative w-full rounded-lg overflow-hidden" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
            <Loader className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

      </div>
    </div>
  )
}
