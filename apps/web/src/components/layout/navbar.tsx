"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { useState } from "react"
import Image from "next/image"
import { Logo } from "../logo"
import { Map } from "../icons/map"
import { SearchBar } from "../search/search-bar"
import { FilterDrawerWrapper } from "../filters/filter-drawer-wrapper"
import { useAuth } from "@/hooks/use-auth"

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const isRTL = locale === 'ar'

  // Mock user authentication state - replace with actual auth logic
  const isAuthenticated = true // This should come from your auth context 
  const { user } = useAuth()
  const navItems = [
    {
      id: "home",
      label: isRTL ? "الرئيسية" : "Home",
      href: `/${locale}`,
      icon: Home
    },
    {
      id: "map",
      label: isRTL ? "الخريطة" : "Map",
      href: `/${locale}/map`,
      icon: Map
    },
    {
      id: "favorites",
      label: isRTL ? "المفضلة" : "Favorites",
      href: `/${locale}/favorites`,
      icon: Heart,
      auth: user ? true : false
    },
    {
      id: "about",
      label: isRTL ? "من نحن" : "About",
      href: `/${locale}/about`,
      icon: Info
    },

  ] 

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
              <SheetContent side={isRTL ? "right" : "left"} className="w-80">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse px-6 py-3  border-b border-gray-200">
                    <Logo width={40} height={40} />

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
                      <Link
                        href={`/${locale}/my-listings/add`}
                        className="w-full p-2 flex items-center rounded-md bg-primary text-white justify-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Plus className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {isRTL ? "إضافة عقار" : "Add Property"}
                      </Link>
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
                  placeholder={isRTL ? "ابحث عن عقار، موقع، أو مدينة..." : "Search for property, location, or city..."}
                  className="focus:border-primary focus:outline-none h-12 pr-14 placeholder:text-primary/80 px-5 transition-all w-full rounded-2xl"
                />
              </div>
              <Button
                size="icon"
                variant="transparent"
                onClick={() => setIsFilterOpen(true)}
                className="h-12 w-14 !p-0 !m-0 transition-all"
              >
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </Button>
            </div>

            {/* Mobile Search Icon */}
            <div className="lg:hidden">
              <SearchBar />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <Link href={`/${locale}/notifications`}>
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                  3
                </Badge>
              </Link>
            </Button>

            <Button
              asChild
              className="hidden sm:flex bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Link href={`/${locale}/my-listings/add`}>
                <Plus className="w-4 h-4 mx-1" />
                {isRTL ? "إضافة عقار" : "Add Property"}
              </Link>
            </Button>

            {/* User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 p-1"
                >
                  <Link href={`/${locale}/profile`} className="flex items-center">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name}
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-emerald-100"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
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
