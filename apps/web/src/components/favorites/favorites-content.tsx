"use client"

import { ListingGrid } from "@/components/listings/listing-grid"
import { api } from "@/lib/api"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { SearchBarWrapper } from "../search/search-bar-wrapper"
import { EmptyFavorites } from "./empty-favorites"

interface Listing {
  id: number
  title: {
    ar: string
    en: string
  }
  description: {
    ar: string
    en: string
  }
  price: number
  currency: string
  type: "rent" | "sale"
  cover_image?: string
  images?: Array<{
    url: string
    full_url: string
    sort_order: number
  }>
  governorate: {
    name: {
      ar: string
      en: string
    }
  }
  city?: {
    name: {
      ar: string
      en: string
    }
  } | null
  features?: Array<{
    name: {
      ar: string
      en: string
    }
  }>
  is_featured: boolean
  views_count: number
  favorites_count: number
  pay_every?: number | null
  insurance?: number | null
  is_favorite?: boolean
}

export function FavoritesContent() {
  const t = useTranslations()

  // Fetch favorites using React Query
  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
    isError
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/user/listings?is_favorite=1')

      if (response.isError) {
        throw new Error(response.message || 'Failed to fetch favorites')
      }

      // Filter items to ensure they have is_favorite=true
      const filteredData = (response.data || []).filter((item: Listing) =>
        item.is_favorite === true
      )

      return filteredData
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const favorites = favoritesData || []


  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="p-4 pt-4">
          <SearchBarWrapper />
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">
            {error?.message || 'An error occurred while fetching favorites'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show empty state if no favorites
  if (!isLoading && (favorites as Listing[]).length === 0) {
    return <EmptyFavorites />
  }

  // Handle when a listing is removed from favorites
  const handleFavoriteRemoved = (listingId: number) => {
    // React Query will handle the cache invalidation automatically
    // We can also manually refetch to ensure data consistency
    refetch()
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-background pb-24">
      {/* Header */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('navigation.favorites.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? t('navigation.favorites.single_listing') : t('navigation.favorites.multiple_listings')}
        </p>
      </div>

      <main className="space-y-6 px-4 ">
        <ListingGrid
          data={favorites}
          isLoading={isLoading}
          onFavoriteRemoved={handleFavoriteRemoved}
        />
      </main>
    </div>
  )
}
