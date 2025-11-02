"use client"

import { Bell, ChevronLeft, FileText, Lock, Pencil, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { logout } from "@/lib/logout"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

const MenuItems = [
  {
    key: "editAccount",
    href: "/profile/edit",
    icon: Pencil
  },
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
    key: "notifications",
    href: "/notifications",
    icon: Bell
  },
  {
    key: "settings",
    href: "/settings",
    icon: Settings
  },
  {
    key: "logout",
    href: "#",
    icon: LogOut,
    isLogout: true
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
  const {
    data: userData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/user/me')

      if (response.isError) {
        throw new Error(response.message || 'Failed to fetch user profile')
      }

      return response.data as User
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const user = userData

  // Helper function to format phone number with +
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ''
    return phone.startsWith('+') ? phone : `+${phone}`
  }

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return locale === 'ar' ? 'م' : 'U'
    const words = name.trim().split(' ')
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }

  // Check if avatar is default
  const isDefaultAvatar = (avatarUrl: string) => {
    return avatarUrl && avatarUrl.includes('default_avatar.jpg')
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success(t('logoutSuccess'))
    } catch (error) {
      toast.error(t('logoutError'))
    }
  }

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
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
          <div className="relative">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20">
              {user?.avatar_url && !isDefaultAvatar(user.avatar_url) ? (
                <img
                  src={user.avatar_url}
                  alt={user?.full_name || t('title')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary-foreground">
                    {getInitials(user?.full_name || '')}
                  </span>
                </div>
              )}
            </div>
            <Link href={"/profile/edit"} className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Pencil className="h-5 w-5 text-primary-foreground" />
            </Link>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user?.full_name || ''}</h2>
            <p className="text-muted-foreground mt-1 text-center" dir="ltr">
              {formatPhoneNumber(user?.phone || '')}
            </p>
            {user?.phone_verified && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">{t('validated')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Office Card or Add Button */}
        {/* {user?.full_name ? <OfficeCard /> : (
          <Link href="/profile/office/add">
            <Button className="w-full h-14 text-lg rounded-2xl">إضافة مكتب</Button>
          </Link>
        )} */}

        {/* Menu Items */}
        <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-4 gap-2" dir={direction}>
          {MenuItems.map((item) => (
            item.isLogout ? (
              <button
                key={item.href}
                onClick={handleLogout}
                className="w-full px-2 cursor-pointer text-lg flex items-center justify-between p-4 bg-card rounded-2xl border transition-colors hover:bg-destructive/10 hover:border-destructive/20"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 mx-2 text-destructive" />
                  <span className="font-medium text-sm text-destructive">{t(`menuItems.${item.key}`)}</span>
                </div>
                <div className="w-10 h-10 bg-destructive/20 rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5 text-destructive ltr:rotate-180 rtl:rotate-0 " />
                </div>
              </button>
            ) : (
              <Link href={item.href} key={item.href} className="w-full px-2 text-lg flex items-center justify-between p-4 bg-card rounded-2xl border transition-colors">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 mx-2 text-muted-foreground" />
                  <span className="font-medium text-sm">{t(`menuItems.${item.key}`)}</span>
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5 ltr:rotate-180 rtl:rotate-0 " />
                </div>
              </Link>
            )
          ))}

        </div>
      </div>
    </div>
  )
}

function ProfileContentSkeleton({ direction }: { direction: 'rtl' | 'ltr' }) {
  return (
    <div className="min-h-screen bg-background pb-24" dir={direction}>
      <div className="p-6 space-y-6">
        {/* Profile Section Skeleton */}
        <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
          <div className="relative">
            {/* Avatar Skeleton */}
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse">
              <div className="absolute inset-0 animate-shimmer opacity-50" />
            </div>
            {/* Edit Button Skeleton */}
            <div className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full animate-pulse overflow-hidden">
              <div className="absolute inset-0 animate-shimmer opacity-50" />
            </div>
          </div>
          <div className="text-center space-y-2">
            {/* Name Skeleton */}
            <div className="relative h-8 w-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg mx-auto animate-pulse overflow-hidden">
              <div className="absolute inset-0 animate-shimmer opacity-50" />
            </div>
            {/* Phone Skeleton */}
            <div className="relative h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg mx-auto animate-pulse overflow-hidden">
              <div className="absolute inset-0 animate-shimmer opacity-50" />
            </div>
          </div>
        </div>

        {/* Menu Items Skeleton */}
        <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-4 gap-2" dir={direction}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="relative w-full px-2 flex items-center justify-between p-4 bg-card rounded-2xl border animate-pulse overflow-hidden"
            >
              <div className="flex items-center gap-3">
                {/* Icon Skeleton */}
                <div className="w-5 h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
                {/* Text Skeleton */}
                <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
              </div>
              {/* Arrow Skeleton */}
              <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl" />
              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-shimmer opacity-50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
