"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Menu,
  Search,
  Bell,
  Heart,
  User,
  Home,
  Plus,
  Building2,
  Key,
  Info,
  SlidersHorizontal,
  Pencil,
  Lock,
  FileText,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Clock } from "lucide-react"
import { Logo } from "../logo"
import { Map } from "../icons/map"
import { SearchBar } from "../search/search-bar"
import { FilterDrawerWrapper } from "../filters/filter-drawer-wrapper"
import { useAuth } from "@/hooks/use-auth"
import { LanguageSwitcher } from "../language-switcher"
import { logout } from "@/lib/logout"
import { toast } from "sonner"
import { api } from "@/lib/api"

interface NavbarProps {
  className?: string
}

const MenuItems = [
  {
    key: "profile",
    href: "/profile",
    icon: User,
    isAuth: true
  },
  {
    key: "editAccount",
    href: "/profile/edit",
    icon: Pencil,
    isAuth: true
  },
  {
    key: "changePassword",
    href: "/profile/change-password",
    icon: Lock,
    isAuth: true
  },
  {
    key: "myListings",
    href: "/my-listings",
    icon: FileText,
    isAuth: true
  },
  {
    key: "notifications",
    href: "/notifications",
    icon: Bell,
    isAuth: true
  },
  {
    key: "settings",
    href: "/settings",
    icon: Settings,
    isAuth: true
  },
  {
    key: "logout",
    href: "#",
    icon: LogOut,
    isLogout: true
  },
  {
    key: "login",
    href: "/login",
    icon: User,
    isAuth: false
  },
  {
    key: "register",
    href: "/register",
    icon: User,
    isAuth: false
  },
]

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('profile.menuItems')
  const tProfile = useTranslations('profile')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const isRTL = locale === 'ar'

  // Get authentication state from useAuth hook
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success(tProfile('logoutSuccess'))
      router.push(`/${locale}/login`)
      router.refresh()
    } catch (error) {
      toast.error(tProfile('logoutError'))
    }
  }

  // Filter nav items based on authentication
  const navItems = [
    {
      id: "home",
      label: isRTL ? "الرئيسية" : "Home",
      href: `/${locale}`,
      icon: Home,
      requiresAuth: false
    },
    {
      id: "map",
      label: isRTL ? "الخريطة" : "Map",
      href: `/${locale}/map`,
      icon: Map,
      requiresAuth: false
    },
    {
      id: "favorites",
      label: isRTL ? "المفضلة" : "Favorites",
      href: `/${locale}/favorites`,
      icon: Heart,
      requiresAuth: true
    },
    {
      id: "about",
      label: isRTL ? "من نحن" : "About",
      href: `/${locale}/about-app`,
      icon: Info,
      requiresAuth: false
    },
  ].filter(item => !item.requiresAuth || isAuthenticated)

  // Filter menu items based on authentication
  const filteredMenuItems = MenuItems.filter((item) => {
    if (item.isLogout) {
      return isAuthenticated // Show logout only if authenticated
    }
    if (item.isAuth === true) {
      return isAuthenticated // Show auth-required items only if authenticated
    }
    if (item.isAuth === false) {
      return !isAuthenticated // Show non-auth items only if not authenticated
    }
    return true // Show items without auth requirement
  })

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 ",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-gray-600 hover:text-emerald-600"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-full max-w-[250px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Logo width={40} height={40} />
                    </div>
                    {/* Mobile Language Switcher */}
                    <div className="sm:hidden ">
                      <LanguageSwitcher />
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <div className="space-y-2 p-2">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "flex items-center space-x-3 gap-2 rtl:space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "text-emerald-600 bg-emerald-50"
                                : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center space-x-3 rtl:space-x-reverse lg:rtl:ml-6 lg:ltr:mr-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* Logo Icon */}
                <Logo width={40} height={40} />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 rtl:mx-4 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors !m-0",
                      isActive
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Desktop Search with Filters */}
            <div className="hidden lg:flex items-center gap-3 bg-primary/20 rounded-2xl w-full max-w-lg">
              <div className="flex flex-row w-full relative">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={isRTL ? "ابحث عن إعلان، منتج، خدمة، أو موقع..." : "Search for listing, product, service, or location..."}
                  className="focus:border-primary focus:outline-none h-10 pr-14 placeholder:text-primary/80 px-5 transition-all w-full rounded-2xl"
                />
              </div>
              <Button
                size="icon"
                variant="transparent"
                onClick={() => setIsFilterOpen(true)}
                className="h-10 w-14 !p-0 !m-0 transition-all"
              >
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </Button>
            </div>

            {/* {isAuthenticated && ( */}
            <Link
              href={`/${locale}/my-listings/create`} 
              className="w-full p-2 flex items-center rounded-md bg-primary text-white justify-center max-w-max text-xs"
              onClick={() => setIsMenuOpen(false)}
            >
              <Plus className="w-4 h-4 mr-2 rtl:mr-0 ltr:mr-0 rtl:ml-0 rtl:md:ml-2  " />
              <span className="hidden sm:block">{isRTL ? "إضافة إعلان" : "Add listing"}</span>
            </Link>
            {/* )} */}
            {/* Mobile Search Icon */}
            <div className="lg:hidden">
              <SearchBar />
            </div>
 
            {/* Language Switcher */}
            <div className="hidden sm:flex">
              <LanguageSwitcher />
            </div>

            {/* Notifications - Only show if authenticated */}
            {isAuthenticated && (
              <NotificationBell locale={locale} />
            )}

            {/* Add Property Button - Only show if authenticated */}

            {/* User Menu */}
            <div className="relative items-center flex mx-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      className="text-gray-600 rounded-full max-w-max px-4 py-auto w-max   overflow-hidden"
                    >
                      {user?.avatar_url && user?.avatar !== "avatars/default_avatar.jpg" ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name || 'User'}
                          width={35}
                          height={35}
                          className="rounded-full aspect-square border-2 border-emerald-100 object-cover max-h-[35px] max-w-[35px]"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align={isRTL ? "start" : "end"}
                    className="w-56 bg-white"
                    sideOffset={8}
                  >
                    <DropdownMenuLabel className="font-normal">

                      <div className="flex rtl:flex-row-reverse items-center gap-2 space-y-1">
                        {user?.avatar_url && user?.avatar !== "avatars/default_avatar.jpg" ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.full_name || 'User'}
                            width={35}
                            height={35}
                            className="rounded-full aspect-square border-2 border-emerald-100 object-cover max-h-[35px] max-w-[35px]"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium leading-none rtl:text-end text-start">
                            {user?.full_name || 'User'}
                          </p>
                          {user?.phone && (
                            <p className="text-xs leading-none text-muted-foreground rtl:text-end text-start">
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filteredMenuItems.map((item) => {
                      if (item.isLogout) {
                        return (
                          <DropdownMenuItem
                            key={item.key}
                            variant="destructive"
                            onClick={handleLogout}
                            className="cursor-pointer rtl:text-end flex rtl:flex-row-reverse"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{t(item.key)}</span>
                          </DropdownMenuItem>
                        )
                      }
                      return (
                        <DropdownMenuItem key={item.key} asChild>
                          <Link
                            href={`/${locale}${item.href}`}
                            className="flex items-center cursor-pointer rtl:text-end text-start rtl:flex-row-reverse hover:text-primary group"
                          >
                            <item.icon className="w-4 h-4 group-hover:text-primary" />
                            <span className="group-hover:text-primary">{t(item.key)}</span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                  asChild
                >
                  <Link href={`/${locale}/login`}>
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawerWrapper open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </header>
  )
}

// Notification Bell Component
interface NotificationBellProps {
  locale: string
}

interface Notification {
  id: number
  title: string
  message: string
  notificationable_id?: number | null
  notificationable_type?: string | null
  read_at?: string | null
  is_read: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

function NotificationBell({ locale }: NotificationBellProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const isRTL = locale === 'ar'

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'header'],
    queryFn: async () => {
      const response = await api.get('/user/notifications', {
        params: { per_page: 5 }
      })

      if (response.isError) {
        return []
      }

      return response.data?.data || response.data || []
    },
    staleTime: 30000,
    refetchInterval: 60000, // تحديث كل دقيقة
    enabled: isOpen, // جلب البيانات فقط عند فتح النافذة
  })

  const notifications = notificationsData || []
  const unreadCount = notifications.filter((n: Notification) => !n.is_read).length
  const totalUnreadCount = user?.notifications_unread_count || unreadCount

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/user/notifications/${id}/read`)

      if (response.isError) {
        throw new Error(response.message || 'Failed to mark notification as read')
      }

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return isRTL ? "الآن" : "Now"
    if (diffInSeconds < 3600) return isRTL ? `منذ ${Math.floor(diffInSeconds / 60)} دقيقة` : `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return isRTL ? `منذ ${Math.floor(diffInSeconds / 3600)} ساعة` : `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return isRTL ? `منذ ${Math.floor(diffInSeconds / 86400)} يوم` : `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
        >
          <Bell className="w-5 h-5" />
          {totalUnreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white" align={isRTL ? "start" : "end"} dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-foreground">
            {isRTL ? "الإشعارات" : "Notifications"}
          </h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} {isRTL ? "غير مقروء" : "unread"}
            </Badge>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isRTL ? "لا توجد إشعارات" : "No notifications"}
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px]">
              <div className="divide-y" dir="rtl">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 transition-colors hover:bg-muted/50 cursor-pointer",
                      !notification.is_read && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (!notification.is_read) handleMarkAsRead(notification.id)
                    }}
                  >
                    <div className="flex items-start gap-3 rtl:flex-row">
                      <div className={cn(
                        "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
                        !notification.is_read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 ">
                          <h4 className={cn(
                            "text-sm font-medium text-foreground text-start ",
                            !notification.is_read && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t">
              <Link href={`/${locale}/notifications`} onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full" size="sm">
                  {isRTL ? "عرض الكل" : "View All"}
                </Button>
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
