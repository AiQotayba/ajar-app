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

  // Check if location permission was previously granted
  useEffect(() => {
    const checkLocationPermission = () => {
      // Check if permission was previously granted
      const permissionStatus = localStorage.getItem('locationPermission')
      
      if (permissionStatus === 'granted') {
        setHasPermission(true)
        setShowPermissionModal(false)
        return
      }
      
      if (permissionStatus === 'denied') {
        setHasPermission(false)
        setShowPermissionModal(false)
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
          },
          (error) => {
            // Permission denied or not available
            if (error.code === error.PERMISSION_DENIED) {
              setShowPermissionModal(true)
            } else {
              // Other error, show modal to request permission
              setShowPermissionModal(true)
            }
          },
          { timeout: 1000 }
        )
      } else {
        // Geolocation not supported
        setShowPermissionModal(true)
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
