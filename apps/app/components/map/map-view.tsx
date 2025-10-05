"use client"

import { useState } from "react"
import { MapPin, Minus, Plus, Locate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MapViewProps {
  hasPermission: boolean
}

const properties = [
  { id: 1, lat: 36.2, lng: 37.15, type: "rent", price: "400$", period: "شهر" },
  { id: 2, lat: 36.22, lng: 37.18, type: "rent", price: "350$", period: "شهر" },
  { id: 3, lat: 36.18, lng: 37.12, type: "sale", price: "50000$", period: "" },
  { id: 4, lat: 36.21, lng: 37.14, type: "rent", price: "500$", period: "شهر" },
]

export function MapView({ hasPermission }: MapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(1)
  const [filterType, setFilterType] = useState<"rent" | "sale">("rent")

  return (
    <div className="relative h-[calc(100vh-180px)] rounded-3xl overflow-hidden bg-muted">
      {/* Map Placeholder */}
      <img src="/map-of-aleppo-syria.jpg" alt="Map" className="w-full h-full object-cover" />

      {/* Property Markers */}
      {properties.map((property) => (
        <button
          key={property.id}
          onClick={() => setSelectedProperty(property.id)}
          className="absolute"
          style={{
            top: `${(property.lat - 36.15) * 1000}px`,
            left: `${(property.lng - 37.1) * 1000}px`,
          }}
        >
          <div className={`relative ${property.type === "rent" ? "text-primary" : "text-destructive"}`}>
            <MapPin className="h-10 w-10 fill-current drop-shadow-lg" />
            <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-md" />
          </div>
        </button>
      ))}

      {/* Selected Property Card */}
      {selectedProperty && (
        <div className="absolute top-4 left-4 right-4 bg-white rounded-2xl shadow-lg p-4 animate-in slide-in-from-top">
          <div className="flex gap-3">
            <img src="/modern-apartment-living.png" alt="Property" className="w-24 h-20 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    دفع 6 أشهر
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    أجار
                  </Badge>
                </div>
                <span className="text-lg font-bold text-primary">400$/شهر</span>
              </div>
              <p className="text-sm text-foreground line-clamp-1">شقة عائلية واسعة ومفروشة بالكامل..</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>5 غرف-مفروش</span>
                <span>تأمين: $200</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-white shadow-lg">
            <Locate className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-white shadow-lg">
            <Minus className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="secondary" className="h-12 w-12 rounded-full bg-white shadow-lg">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={filterType === "rent" ? "default" : "secondary"}
            onClick={() => setFilterType("rent")}
            className="h-12 px-6 rounded-full shadow-lg"
          >
            إيجار
          </Button>
          <Button
            variant={filterType === "sale" ? "default" : "secondary"}
            onClick={() => setFilterType("sale")}
            className="h-12 px-6 rounded-full shadow-lg bg-white text-foreground hover:bg-white/90"
          >
            بيع
          </Button>
        </div>
      </div>
    </div>
  )
}
