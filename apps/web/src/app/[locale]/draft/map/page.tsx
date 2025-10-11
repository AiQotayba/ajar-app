"use client"

import { Header } from "@/components/layout/header"
import { LocationPermissionModal } from "@/components/map/location-permission-modal"
import { MapView } from "@/components/map/map-view"
import { SearchBar } from "@/components/search/search-bar"
import { useState } from "react"

export default function MapPage() {
  const [showPermissionModal, setShowPermissionModal] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  const handleAllowLocation = () => {
    setHasPermission(true)
    setShowPermissionModal(false)
    // Request geolocation permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(" Location granted:", position.coords)
        },
        (error) => {
          console.log(" Location denied:", error)
        },
      )
    }
  }

  const handleDenyLocation = () => {
    setShowPermissionModal(false)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="الخريطة" showBack />

      <main className="px-4 pt-4 space-y-4">
        <SearchBar />
        <MapView hasPermission={hasPermission} />
      </main>

      <LocationPermissionModal open={showPermissionModal} onAllow={handleAllowLocation} onDeny={handleDenyLocation} />
    </div>
  )
}
