"use client"

import { FileText, Settings, Lock } from "lucide-react"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { ProfileHeader } from "./profile-header"
import { ProfileStats } from "./profile-stats"
import { storeUser } from "@/lib/auth/client"

const MenuItems = [
  {
    key: "changePassword",
    href: "/profile/change-password",
    icon: Lock
  },
  {
    key: "myListings",
    href: "/my-listings",
    icon: FileText
  },
  {
    key: "settings",
    href: "/settings",
    icon: Settings
  },
]

interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  phone: string
  email?: string
  avatar?: string
  avatar_url?: string
  role: string
  status: string
  phone_verified: boolean
  language?: string
  wallet_balance: number
  notifications_unread_count: number
  listings_count: number
  created_at: string
  updated_at: string
}

export function ProfileContent() {
  const t = useTranslations('profile')
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  // Fetch user data using React Query
  const { data: userData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/user/me')

      if (response.isError) {
        throw new Error(response.message || 'Failed to fetch user profile')
      }
      storeUser(response.data as any)
      return response.data as User
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const user = userData

  // Loading state
  if (isLoading) {
    return <ProfileContentSkeleton direction={direction} />
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background pb-24" dir={direction}>
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              {error?.message || t('loadError')}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24" dir={direction}>
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          user={user || null}
          getLabel={(key) => t(key)}
          locale={locale}
        />

        {/* Menu Items using ProfileStats */}
        <ProfileStats
          items={MenuItems}
          locale={locale}
          getLabel={(key) => t(`menuItems.${key}`)}
        />
      </div>
    </div>
  )
}

function ProfileContentSkeleton({ direction }: { direction: 'rtl' | 'ltr' }) {
  return (
    <div className="min-h-screen bg-background pb-24" dir={direction}>
      <div className="p-6 space-y-6">
        {/* Profile Header Skeleton */}
        <div className="relative bg-card rounded-3xl p-4 md:p-6 shadow-lg border border-border/50 overflow-hidden max-w-4xl mx-auto animate-pulse">
          <div className="flex flex-row items-center gap-6 md:gap-8">
            {/* Avatar Skeleton */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-r from-gray-100 to-gray-200">
                <div className="absolute inset-0 animate-shimmer opacity-50" />
              </div>
              {/* Edit Button Skeleton */}
              <div className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-50" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {/* Name Skeleton */}
              <div className="relative h-7 md:h-8 w-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-50" />
              </div>
              {/* Phone Skeleton */}
              <div className="relative h-5 w-36 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-50" />
              </div>
              {/* Email Skeleton */}
              <div className="relative h-4 w-52 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 animate-shimmer opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto mt-6 gap-4" dir={direction}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="relative bg-card rounded-3xl p-4 md:p-6 shadow-lg border border-border/50 animate-pulse overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Icon Skeleton */}
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl" />
                  {/* Text Skeleton */}
                  <div className="h-5 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
                </div>
                {/* Arrow Skeleton */}
                <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl" />
              </div>
              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-shimmer opacity-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
