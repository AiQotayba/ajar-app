"use client"

import { Button } from "@/components/ui/button"
import { Bell, ChevronLeft, FileText, Lock, Pencil, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Header } from "../layout/header"
import { OfficeCard } from "./office-card"
import { logout } from "@/lib/logout"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
const MenuItems = [
  {
    title: "تعديل بيانات الحساب",
    href: "/profile/edit",
    icon: Pencil
  },
  {
    title: "تغيير كلمة المرور",
    href: "/profile/change-password",
    icon: Lock
  },
  {
    title: "إعلاناتي",
    href: "/my-listings",
    icon: FileText
  },
  {
    title: "الإشعارات",
    href: "/notifications",
    icon: Bell
  },
  {
    title: "الإعدادات",
    href: "/settings",
    icon: Settings
  },
  {
    title: "تسجيل الخروج",
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
    if (!name) return 'م'
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
      toast.success("تم تسجيل الخروج بنجاح")
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title="حسابي" showBack />
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
            <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
            <div className="text-center space-y-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title="حسابي" showBack />
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              {error?.message || 'حدث خطأ في تحميل بيانات الملف الشخصي'}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <Header title="حسابي" showBack />

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
          <div className="relative">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20">
              {user?.avatar_url && !isDefaultAvatar(user.avatar_url) ? (
                <img
                  src={user.avatar_url}
                  alt={user?.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary-foreground">
                    {getInitials(user?.full_name || 'المستخدم')}
                  </span>
                </div>
              )}
            </div>
            <Link href={"/profile/edit"} className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Pencil className="h-5 w-5 text-primary-foreground" />
            </Link>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user?.full_name || 'المستخدم'}</h2>
            <p className="text-muted-foreground mt-1 text-center" dir="ltr">
              {formatPhoneNumber(user?.phone || '')}
            </p>
            {user?.phone_verified && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">مُتحقق</span>
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
        <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-4 gap-2" dir="rtl">
          {MenuItems.map((item) => (
            item.isLogout ? (
              <button
                key={item.href}
                onClick={handleLogout}
                className="w-full px-2 cursor-pointer text-lg flex items-center justify-between p-4 bg-card rounded-2xl border transition-colors hover:bg-destructive/10 hover:border-destructive/20"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 mx-2 text-destructive" />
                  <span className="font-medium text-sm text-destructive">{item.title}</span>
                </div>
                <div className="w-10 h-10 bg-destructive/20 rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5 text-destructive" />
                </div>
              </button>
            ) : (
              <Link href={item.href} key={item.href} className="w-full px-2 text-lg flex items-center justify-between p-4 bg-card rounded-2xl border transition-colors">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 mx-2 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5" />
                </div>
              </Link>
            )
          ))}

        </div>
      </div>
    </div>
  )
}
