"use client"

import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HeartIcon } from "../icons/heart"
import { HomeIcon } from "../icons/home"
import { Map } from "../icons/map"
import { Profile } from "../icons/profile"
export function BottomNav() {
  const pathname = usePathname()

  // تعريف العناصر
  const navItems = [
    { id: "home", label: "الرئيسية", icon: (props: React.SVGProps<SVGSVGElement>) => <HomeIcon  {...props} />, href: "/" },
    { id: "map", label: "الخريطة", icon: (props: React.SVGProps<SVGSVGElement>) => <Map  {...props} />, href: "/map" },
    { id: "add", label: "إضافة", icon: Plus, href: "/my-listings/add", isSpecial: true },
    { id: "favorites", label: "المفضلة", icon: (props: React.SVGProps<SVGSVGElement>) => <HeartIcon {...props} />, href: "/favorites" },
    { id: "profile", label: "حسابي", icon: (props: React.SVGProps<SVGSVGElement>) => <Profile  {...props} />, href: "/profile" },
  ]

  // تحديد التبويب النشط عبر pathname
  const activeItem = navItems.find(item => pathname === item.href)?.id

  // إذا لم يكن المسار الحالي ضمن روابط التبويبات → لا تُعرض القائمة
  const isInNav = navItems.some(item => pathname.startsWith(item.href))
  if (!isInNav) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          if (item.isSpecial) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-8"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <Icon className={cn("h-7 w-7 border-2 border-white rounded-full", isActive && "*:fill-primary")} />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "*:!fill-primary")} />
              <span className={cn("text-xs font-medium", isActive && "font-bold")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

