"use client"

import { useState } from "react"
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
  SidebarClose,
  SidebarOpen,
  TestTube2Icon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/auth"
import { toast } from "sonner"
import { Button } from "../ui/button"

interface MenuItem {
  icon: any
  label: string
  href: string
  isSpecial?: boolean
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/dashboard" },
  { icon: Building2, label: "الإعلانات", href: "/listings" },
  { icon: FolderTree, label: "الفئات", href: "/categories" },
  // { icon: Database, label: "الخصائص", href: "/properties" },
  // { icon: Sparkles, label: "المميزات", href: "/features" },
  { icon: MapPin, label: "المواقع", href: "/locations" },
  { icon: ImageIcon, label: "السلايدر", href: "/sliders" },
  { icon: Star, label: "التقييمات", href: "/reviews" },
  { icon: Users, label: "المستخدمين", href: "/users" },
  { icon: User, label: "حسابي", href: "/profile", isSpecial: true },
  { icon: Settings, label: "الإعدادات", href: "/settings", isSpecial: true },
  { icon: TestTube2Icon, label: "test", href: "/table", },
]

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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
        href={item.href}
        prefetch={true}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          isActive
            ? "bg-primary/10 shadow-lg text-primary"
            : "text-foreground/70 hover:bg-muted/50 hover:text-foreground",
          !isOpen && "w-max"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className={cn(!isOpen && "hidden")}>{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* زر القائمة للموبايل */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-primary text-white shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 h-screen border-l border-border/50 bg-card/60 backdrop-blur-xl shadow-xl transition-transform duration-300",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "translate-x-full",
          isOpen && "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex h-16 items-center border-b border-border/50 justify-between",
            !isOpen && "justify-center",
            isOpen && "pr-6 pl-2"
          )}>
            {isOpen && <h1 className="text-2xl font-bold text-primary">أجار</h1>}

            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <SidebarOpen className="h-8 w-8 stroke-primary" />
              ) : (
                <SidebarClose className="h-8 w-8 stroke-primary" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {menuItems
              .filter(item => !item.isSpecial)
              .map(item => <Item item={item} />)
            }
          </nav>

          {/* Special Items & Logout */}
          <div className="border-t border-border/50 p-2 space-y-1">
            {menuItems
              .filter(item => item.isSpecial)
              .map(item => (
                <Item key={item.href} item={item} />
              ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive/70 transition-all hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className={cn(!isOpen && "hidden")}>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* خلفية غامقة عند فتح الموبايل */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
