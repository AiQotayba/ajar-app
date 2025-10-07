"use client"

import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useLocale } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HeartIcon } from "../icons/heart"
import { HomeIcon } from "../icons/home"
import { Map } from "../icons/map"
import { Profile } from "../icons/profile"

export function BottomNav() {
  const pathname = usePathname()
  const locale = useLocale()

  const navItems = [
    { id: "home", label: "الرئيسية", icon: (props: React.SVGProps<SVGSVGElement>) => <HomeIcon  {...props} />, href: `/${locale}` },
    { id: "map", label: "الخريطة", icon: (props: React.SVGProps<SVGSVGElement>) => <Map  {...props} />, href: `/${locale}/map` },
    { id: "add", label: "إضافة", icon: Plus, href: `/${locale}/my-listings/add`, isSpecial: true },
    { id: "favorites", label: "المفضلة", icon: (props: React.SVGProps<SVGSVGElement>) => <HeartIcon {...props} />, href: `/${locale}/favorites` },
    { id: "profile", label: "حسابي", icon: (props: React.SVGProps<SVGSVGElement>) => <Profile  {...props} />, href: `/${locale}/profile` },
  ]

  // اضهار الـ nav في صفحات  التالية  
  const authPages = [`/${locale}`, `/${locale}/map`, `/${locale}/favorites`, `/${locale}/profile`]

  if (!authPages.some(page => pathname.includes(page))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          if (item.isSpecial) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-14"
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

