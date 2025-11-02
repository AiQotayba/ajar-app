"use client"

import { Header } from "@/components/layout/header"
import { LocationPermissionModal } from "@/components/map/location-permission-modal"
import { MapView } from "@/components/map/map-view"
import { SearchBarWrapper } from "@/components/search/search-bar-wrapper"
import { useTranslations } from 'next-intl'
import { useState, useEffect } from "react"

export default function MapPage() {
  const t = useTranslations('map')
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if location permission was previously granted
  useEffect(() => {
    const checkLocationPermission = () => {
      // Check if permission was previously granted
      const permissionStatus = localStorage.getItem('locationPermission')
      
      if (permissionStatus === 'granted') {
        setHasPermission(true)
        setShowPermissionModal(false)
        setIsLoading(false)
        return
      }
      
      if (permissionStatus === 'denied') {
        setHasPermission(false)
        setShowPermissionModal(false)
        setIsLoading(false)
        return
      }
      
      // No previous permission status, check current status
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Permission is granted
            setHasPermission(true)
            setShowPermissionModal(false)
            localStorage.setItem('locationPermission', 'granted')
            setIsLoading(false)
          },
          (error) => {
            // Permission denied or not available
            if (error.code === error.PERMISSION_DENIED) {
              setShowPermissionModal(true)
            } else {
              // Other error, show modal to request permission
              setShowPermissionModal(true)
            }
            setIsLoading(false)
          },
          { timeout: 1000 }
        )
      } else {
        // Geolocation not supported
        setShowPermissionModal(true)
        setIsLoading(false)
      }
    }

    checkLocationPermission()
  }, [])

  const handleAllowLocation = () => {
    setHasPermission(true)
    setShowPermissionModal(false)
    // Save permission to localStorage
    localStorage.setItem('locationPermission', 'granted')
    
    // Request geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Location granted:", position.coords)
        },
        (error) => {
          console.log("❌ Location denied:", error)
        },
      )
    }
  }

  const handleDenyLocation = () => {
    setShowPermissionModal(false)
    // Save denied permission to localStorage
    localStorage.setItem('locationPermission', 'denied')
  }

  // Function to reset location permission (for testing or user preference change)
  const resetLocationPermission = () => {
    localStorage.removeItem('locationPermission')
    setHasPermission(false)
    setShowPermissionModal(true)
  }

  // Show loading skeleton while checking permissions
  if (isLoading) {
    return (
      <div className="max-h-[90vh] h-screen bg-background flex flex-col">
        <main className="flex-1 relative">
          <MapPageSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="max-h-[90vh] h-screen bg-background flex flex-col">

      <main className="flex-1 relative">
        <MapView hasPermission={hasPermission} onResetPermission={resetLocationPermission} />
      </main>

      <LocationPermissionModal
        open={showPermissionModal}
        onAllow={handleAllowLocation}
        onDeny={handleDenyLocation}
      />
    </div>
  )
}

function MapPageSkeleton() {
  return (
    <div className="relative w-full max-h-[90vh] h-screen animate-pulse">
      {/* Map skeleton */}
      <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer opacity-50" />
        
        {/* Controls skeleton */}
        <div className="absolute bottom-4 left-2 rounded-full right-2 flex gap-2 justify-center">
          <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
            <div className="w-16 h-full bg-gray-200 rounded-md" />
            <div className="w-16 h-full bg-gray-200 rounded-md" />
            <div className="w-16 h-full bg-gray-200 rounded-md" />
          </div>
          <div className="w-10 h-10 bg-white rounded-full shadow-lg" />
          <div className="flex gap-1 bg-white rounded-full shadow-lg p-1">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
