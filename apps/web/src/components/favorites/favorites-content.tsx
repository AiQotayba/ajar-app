"use client"

import { ListingCard } from "@/components/listings/listing-card"
import { useState } from "react"
import { Header } from "../layout/header"
import { SearchBar } from "../search/search-bar"
import { EmptyFavorites } from "./empty-favorites"

// Mock data - replace with real data

const mockFavorites: any = []
const mockFavoritesNone = [
  {
    id: 1,
    image: "/luxury-modern-house-exterior-wooden-deck.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "400",
    period: "دفع 6 أشهر",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: true,
    deposit: "$200",
    badge: "مؤجر",
    badgeType: "rent" as const,
    isFavorite: true,
  },
  {
    id: 2,
    image: "/white-traditional-house-with-porch.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "14000",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: false,
    badge: "بيع",
    badgeType: "rent" as const,
  },
  {
    id: 3,
    image: "/modern-white-villa-with-pool.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "500",
    period: "دفع 3 أشهر",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: true,
    deposit: "$150",
    badge: "مميز",
    badgeType: "featured" as const,
    safe_home: "200$",
    isFavorite: false,
  },
  {
    id: 4,
    image: "/luxury-modern-house-exterior-wooden-deck.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "400",
    period: "دفع 6 أشهر",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: true,
    deposit: "$200",
    badge: "مؤجر",
    badgeType: "rent" as const,
    isFavorite: true,
  },
  {
    id: 5,
    image: "/white-traditional-house-with-porch.jpg",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق.",
    price: "14000",
    location: "مدينة إدلب",
    bedrooms: 5,
    furnished: false,
    badge: "بيع",
    badgeType: "rent" as const,
  },
  {
    id: 1,
    image: "/images/placeholder.svg?height=400&width=600",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق",
    price: "400",
    period: "دفعة 6 أشهر",
    location: "حلب - مدينة إجار",
    bedrooms: 5,
    furnished: true,
    deposit: "200",
    badge: "مؤجر",
    badgeType: "rent" as const,
    isFavorite: true,
  },
  {
    id: 2,
    image: "/images/placeholder.svg?height=400&width=600",
    title: "شقة عائلية واسعة ومفروشة بالكامل للإيجار بموقع مركزي",
    description: "قريب من المدارس والأسواق",
    price: "400",
    period: "دفعة 6 أشهر",
    location: "حلب - مدينة إجار",
    bedrooms: 5,
    furnished: true,
    deposit: "200",
    badge: "مؤجر",
    badgeType: "rent" as const,
    isFavorite: true,
  },
]

export function FavoritesContent() {
  const [favorites] = useState(mockFavorites)
  const [searchQuery, setSearchQuery] = useState("")

  // Show empty state if no favorites
  if (favorites.length === 0) {
    return <EmptyFavorites />
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <Header title="المفضلة" showNotification showBack />

      <div className="p-4 pt-4">
        <SearchBar />
      </div>
      <main className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
          {favorites.map((listing: any) => (
            <div key={listing.id} className="w-full mx-auto">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </main>

    </div>
  )
}
