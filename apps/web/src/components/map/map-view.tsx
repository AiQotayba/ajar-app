"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { PinGreenIcon, PinIcon, PinRedIcon } from '@/components/icons/pin'
import { useRouter } from 'next/navigation'
import { MinusIcon, PlusIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface MapViewProps {
  hasPermission: boolean
  onResetPermission?: () => void
}

interface Cluster {
  type: 'cluster'
  cluster_id: string
  count: number
  lat: number
  lng: number
  expansionZoom: number
  bbox: {
    north: number
    south: number
    east: number
    west: number
  }
  clusterRadiusMeters: number
  nudgeZoomIfStillCluster: number
}

interface Property {
  type: 'ad'
  id: number
  lat: number
  lng: number
}

type MapData = Cluster | Property

interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export function MapView({ hasPermission, onResetPermission }: MapViewProps) {
  const t = useTranslations('map')
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [currentZoom, setCurrentZoom] = useState(12)
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null)
  const [propertyType, setPropertyType] = useState<'all' | 'rent' | 'sell'>('all')
  const router = useRouter()

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !hasPermission) return

    const initMap = () => {
      if (window.google && window.google.maps) {
        const map = new window.google.maps.Map(mapRef.current!, {
          center: { lat: 35.9300, lng: 36.6300 }, // Damascus coordinates
          zoom: 12,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry.fill',
              stylers: [{ color: '#f5f5f5' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry.fill',
              stylers: [{ color: '#e0f2fe' }]
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        mapInstanceRef.current = map

        // Add map event listeners
        map.addListener('bounds_changed', () => {
          const bounds = map.getBounds()
          if (bounds) {
            const north = bounds.getNorthEast().lat()
            const south = bounds.getSouthWest().lat()
            const east = bounds.getNorthEast().lng()
            const west = bounds.getSouthWest().lng()

            setCurrentBounds({ north, south, east, west })
            setCurrentZoom(map.getZoom() || 12)
          }
        })
      }
    }

    if (window.google) {
      initMap()
    } else {
      // Load Google Maps script if not already loaded
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry`
      script.onload = initMap
      document.head.appendChild(script)
    }
  }, [hasPermission])

  // React Query for map data
  const {
    data: mapDataResponse,
    isLoading: loading,
    isFetching,
  } = useQuery({
    queryKey: ['map-listings', currentBounds, propertyType, currentZoom],
    queryFn: async () => {
      if (!currentBounds) return null

      const params = new URLSearchParams({
        map_mode: '1',
        north: currentBounds.north.toString(),
        south: currentBounds.south.toString(),
        east: currentBounds.east.toString(),
        west: currentBounds.west.toString(),
        zoom: currentZoom.toString(),
        max_items: '400',
        radius_px: '48',
        merge_factor: '1.1'
      })

      if (propertyType !== 'all') {
        params.append('property_type', propertyType)
      }

      const response = await api.get(`/user/listings?${params.toString()}`)

      if (response.isError) {
        throw new Error(response.message || 'Failed to load map data')
      }

      return response.data as MapData[]
    },
    enabled: !!currentBounds && !!mapInstanceRef.current,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const updateMarkers = useCallback((data: MapData[]) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (!mapInstanceRef.current) return

    data.forEach((item) => {
      if (item.type === 'cluster') {
        const cluster = item as Cluster
        // Create custom cluster icon
        const clusterSize = window.innerWidth < 640 ? 32 : 40
        const clusterIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="${clusterSize}" height="${clusterSize}" viewBox="0 0 ${clusterSize} ${clusterSize}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${clusterSize / 2}" cy="${clusterSize / 2}" r="${clusterSize / 2 - 2}" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
              <text x="${clusterSize / 2}" y="${clusterSize / 2 + 4}" text-anchor="middle" fill="white" font-size="${window.innerWidth < 640 ? '12' : '14'}" font-weight="bold">${cluster.count}</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(clusterSize, clusterSize),
          anchor: new window.google.maps.Point(clusterSize / 2, clusterSize / 2)
        }

        const marker = new window.google.maps.Marker({
          position: { lat: cluster.lat, lng: cluster.lng },
          map: mapInstanceRef.current,
          title: `${cluster.count} ${t('clusters.properties')}`,
          icon: clusterIcon
        })

        marker.addListener('click', () => {
          // Expand cluster
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: cluster.lat, lng: cluster.lng })
            mapInstanceRef.current.setZoom(cluster.expansionZoom)
          }
        })

        markersRef.current.push(marker)
      } else if (item.type === 'ad') {
        const property = item as Property
        // Create custom property icon based on property type
        const propertyTypeIcon = propertyType === 'rent' ? "#01805F" : "#F55157"
        const propertySize = window.innerWidth < 640 ? 18 : 24
        const propertyIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="${propertySize}" height="${propertySize}" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg" >
              <path d="M10.2861 8.90722C9.80561 8.9066 9.3361 8.76351 8.93694 8.49605C8.53778 8.22859 8.22689 7.84877 8.04359 7.40462C7.86029 6.96047 7.81281 6.47194 7.90716 6.00081C8.00151 5.52968 8.23344 5.09711 8.57364 4.75779C8.91383 4.41848 9.347 4.18766 9.81838 4.09453C10.2898 4.0014 10.7782 4.05014 11.2218 4.23459C11.6655 4.41904 12.0445 4.73091 12.3109 5.13076C12.5774 5.53062 12.7192 6.0005 12.7186 6.48098C12.7165 7.12488 12.4593 7.7417 12.0034 8.19642C11.5475 8.65114 10.93 8.90672 10.2861 8.90722ZM10.2861 4.9913C9.99147 4.9913 9.70345 5.07867 9.45847 5.24236C9.2135 5.40604 9.02256 5.6387 8.90981 5.91091C8.79706 6.18311 8.76756 6.48264 8.82504 6.77161C8.88252 7.06058 9.0244 7.32601 9.23273 7.53435C9.44107 7.74269 9.70651 7.88456 9.99548 7.94204C10.2844 7.99952 10.584 7.97002 10.8562 7.85727C11.1284 7.74452 11.361 7.55358 11.5247 7.30861C11.6884 7.06363 11.7758 6.77561 11.7758 6.48098C11.775 6.08615 11.6177 5.70772 11.3385 5.42853C11.0594 5.14934 10.6809 4.99213 10.2861 4.9913Z" fill="${propertyTypeIcon}" />
              <path d="M10.2858 14.3065C9.31742 14.3046 8.38731 13.9285 7.68981 13.2568C5.83744 11.4717 3.78646 8.6243 4.55958 5.23637C4.85437 3.94799 5.58548 2.80114 6.62906 1.99011C7.67263 1.17908 8.96448 0.753748 10.2858 0.786173H10.292C11.6145 0.753496 12.9076 1.17948 13.9517 1.9918C14.9958 2.80412 15.7266 3.95274 16.0201 5.24265C16.7869 8.63059 14.7378 11.4717 12.8836 13.2568C12.1856 13.9289 11.2547 14.305 10.2858 14.3065ZM10.2858 1.72901C9.17743 1.68971 8.09032 2.03972 7.21312 2.71829C6.33592 3.39686 5.724 4.36115 5.48356 5.44379C4.80472 8.40431 6.66525 10.9563 8.34979 12.5716C8.86907 13.0764 9.56471 13.3588 10.2889 13.3588C11.0131 13.3588 11.7087 13.0764 12.228 12.5716C13.9063 10.9563 15.7668 8.40431 15.1005 5.44379C14.8566 4.36059 14.242 3.3966 13.3629 2.71835C12.4838 2.04009 11.3954 1.69016 10.2858 1.72901Z" fill="${propertyTypeIcon}" />
              <ellipse opacity="0.51" cx="10.2855" cy="16.2066" rx="9.92225" ry="5.79334" fill="${propertyTypeIcon}" />
              <ellipse opacity="0.43" cx="10.2856" cy="16.2066" rx="4.5795" ry="2.70356" fill="${propertyTypeIcon}" />
            </svg> 
          `)}`,
          scaledSize: new window.google.maps.Size(propertySize, propertySize),
          anchor: new window.google.maps.Point(propertySize / 2, propertySize / 2)
        }

        const marker = new window.google.maps.Marker({
          position: { lat: property.lat, lng: property.lng },
          map: mapInstanceRef.current,
          title: `Property ${property.id}`,
          icon: propertyIcon
        })

        marker.addListener('click', () => {
          // Navigate to property details
          router.push(`/listings/${property.id}`)
        })

        markersRef.current.push(marker)
      }
    })
  }, [propertyType, t, router])

  // Update markers when map data changes
  useEffect(() => {
    if (mapDataResponse && mapInstanceRef.current) {
      updateMarkers(mapDataResponse)
    }
  }, [mapDataResponse, updateMarkers])

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 12
      mapInstanceRef.current.setZoom(currentZoom + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 12
      mapInstanceRef.current.setZoom(currentZoom - 1)
    }
  }

  const handlePropertyTypeChange = (type: 'all' | 'rent' | 'sell') => {
    setPropertyType(type)
  }

  if (!hasPermission) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">{t('permission.description')}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full max-h-[90vh] h-screen">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading Indicator - Top Right Corner */}
      {(loading || isFetching) && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white rounded-lg p-3 shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 font-medium">{t('loading')}</p>
          </div>
        </div>
      )}


        {/* Zoom Controls */}
      <div className="absolute bottom-4 flex gap-1 justify-center w-min mx-auto left-2 right-2 sm:gap-2 flex-row *:cursor-pointer  rounded-full">
        {/* Property Type Filters */}
        <div className="">
          <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
            <button
              onClick={() => handlePropertyTypeChange('all')}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors text-gray-600 ${propertyType === 'all'
                ? 'border-primary text-primary border'
                : ' hover:bg-gray-100'
                }`}
            >
              {t('filters.all')}
            </button>
            <button
              onClick={() => handlePropertyTypeChange('rent')}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex flex-row gap-1 sm:gap-2 ${propertyType === 'rent'
                ? 'border-primary text-primary border'
                : ' hover:bg-gray-100'
                }`}
            >
              <PinGreenIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              {t('filters.rent')}
            </button>
            <button
              onClick={() => handlePropertyTypeChange('sell')}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex flex-row gap-1 sm:gap-2 ${propertyType === 'sell'
                ? 'border-primary text-primary border'
                : ' hover:bg-gray-100'
                }`}
            >
              <PinRedIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              {t('filters.sell')}
            </button>
        </div>
        </div>
        {/* Location Button */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    })
                    mapInstanceRef.current.setZoom(15)
                  }
                },
                (error) => {
                  console.error('Location error:', error)
                }
              )
            }
          }}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors mb-2 cursor-pointer"
        >
          <PinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
        <div className="flex gap-1 bg-white rounded-full shadow-lg items-center h-min ">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors"
          >
            <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
        </div>
      </div>


      {/* Reset Permission Button (only show if permission was denied) */}
      {!hasPermission && onResetPermission && (
        <div className="absolute top-20 right-4">
          <button
            onClick={onResetPermission}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="إعادة طلب إذن الموقع"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
