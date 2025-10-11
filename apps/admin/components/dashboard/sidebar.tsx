"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderTree,
  MapPin,
  ImageIcon,
  Bell,
  Star,
  Settings,
  Sparkles,
  Database,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/auth"
import { toast } from "sonner"

interface MenuItem {
  icon: any
  label: string
  href: string
  isSpecial?: boolean
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/dashboard" },
  { icon: Building2, label: "الإعلانات", href: "/dashboard/listings" },
  // { icon: Users, label: "المستخدمين", href: "/dashboard/users" },
  { icon: FolderTree, label: "الفئات", href: "/dashboard/categories" },
  { icon: Database, label: "الخصائص", href: "/dashboard/properties" },
  { icon: Sparkles, label: "المميزات", href: "/dashboard/features" },
  { icon: MapPin, label: "المواقع", href: "/dashboard/locations" },
  { icon: ImageIcon, label: "السلايدر", href: "/dashboard/sliders" },
  { icon: Star, label: "التقييمات", href: "/dashboard/reviews" },
  // { icon: Bell, label: "الإشعارات", href: "/dashboard/notifications" },
  { icon: User, label: "حسابي", href: "/dashboard/my-account", isSpecial: true },
  { icon: Settings, label: "الإعدادات", href: "/dashboard/settings", isSpecial: true },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await authApi.logout()
      toast.success("تم تسجيل الخروج بنجاح")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("حدث خطأ أثناء تسجيل الخروج")
    }
  }

  function Item({ item }: { item: MenuItem }) {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={true}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          isActive
            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
            : "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    )
  }
  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-64 border-l border-border/50 bg-card/60 backdrop-blur-xl shadow-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border/50 px-6">
          <h1 className="text-2xl font-bold text-primary">أجار</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.filter(item => !item.isSpecial).map((item) => {
            return <Item key={item.href} item={item} />
          })}
        </nav>

        {/* Special Items & Logout */}
        <div className="border-t border-border/50 p-4 space-y-1">
          {menuItems.filter(item => item.isSpecial).map((item) => {
            return <Item key={item.href} item={item} />
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive/70 transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
