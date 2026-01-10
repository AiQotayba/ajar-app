"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderTree,
  MapPin,
  ImageIcon,
  Star,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/auth"
import { toast } from "sonner"
import { Logo, LogoWhite } from "@/components/logo"

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>
  className?: string
  label: string
  href?: string
  badge?: string | number
  onClick?: () => void
  isDestructive?: boolean
  children?: MenuItem[]
  target?: string
  rel?: string
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "لوحة التحكم",
    href: "/dashboard",
  },
  {
    icon: Building2,
    label: "الإعلانات",
    href: "/listings",
    badge: "12+"
  },
  {
    icon: FolderTree,
    label: "الفئات",
    href: "/categories",
  },
  {
    icon: MapPin,
    label: "المواقع",
    href: "/locations",
  },
  {
    icon: ImageIcon,
    label: "السلايدر",
    href: "/sliders",
  },
  {
    icon: Star,
    label: "التقييمات",
    href: "/reviews",
  },
  {
    icon: Users,
    label: "المستخدمين",
    href: "/users",
  },
  {
    icon: Bell,
    label: "الإشعارات",
    href: "/notifications",
  },
  {
    icon: ExternalLink,
    label: "عرض الموقع",
    href: "https://ajarsyria.com",
    target: "_blank",
    rel: "noopener noreferrer",
  },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(true)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // مراقبة عرض الشاشة للتحكم في isOpen
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null

    const checkScreenSize = () => {
      // إزالة timer السابق إذا كان موجوداً
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }

      // استخدام debounce لتقليل عدد الاستدعاءات
      resizeTimer = setTimeout(() => {
        const isDesktop = window.innerWidth >= 768 // md breakpoint (768px)

        // على الشاشات الصغيرة (mobile)، إغلاق الـ sidebar تلقائياً
        if (!isDesktop && isOpen) {
          setIsOpen(false)
        }

        // على الشاشات الكبيرة (desktop)، إغلاق الـ mobile menu إذا كان مفتوحاً
        if (isDesktop && isMobileOpen) {
          setIsMobileOpen(false)
        }
      }, 150) // debounce delay 150ms
    }

    // فحص الحجم الأولي عند التحميل (بدون debounce)
    const initialCheck = () => {
      const isDesktop = window.innerWidth >= 768
      if (!isDesktop && isOpen) {
        setIsOpen(false)
      }
      if (isDesktop && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }
    initialCheck()

    // إضافة event listener للتغييرات
    window.addEventListener("resize", checkScreenSize)

    // تنظيف عند unmount
    return () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
      window.removeEventListener("resize", checkScreenSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isMobileOpen]) // إزالة setIsOpen من dependencies لتجنب infinite loop

  const handleLogout = async () => {
    try {
      await authApi.logout()
      toast.success("تم تسجيل الخروج بنجاح")
    } catch (error) {
      console.error("❌ Logout error:", error)
      toast.error("حدث خطأ أثناء تسجيل الخروج")
    }
  }

  const generalItems: MenuItem[] = [
    {
      icon: User,
      label: "حسابي",
      href: "/profile",
    },
    {
      icon: Settings,
      label: "الإعدادات",
      href: "/settings",
    },
    {
      icon: LogOut,
      label: "تسجيل الخروج",
      className: "hover:text-white hover:bg-red-500",
      onClick: handleLogout,
      // isDestructive: true,
    },
  ]

  const NavItem = ({ item, showLabel = true, }: { item: MenuItem; showLabel?: boolean; index?: number }) => {
    const Icon = item.icon
    const isActive = item.href ? pathname === item.href : false
    const isButton = !item.href && !!item.onClick

    if (isButton) {
      return (
        <button
          type="button"
          onClick={item.onClick}
          className={cn(
            "group relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer",
            "transition-all duration-200",
            "text-white/80 hover:text-white hover:bg-white/10",
            // item.isDestructive
            //   ? "text-red-200 hover:text-red-100 hover:bg-red-500/20"
            //   : "text-white/80 hover:text-white hover:bg-white/10",
            "outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2",
            !showLabel && "justify-center px-3",
            item.className
          )}
          aria-label={item.label}
        >
          <Icon className="h-5 w-5 shrink-0 text-white/90" />
          {showLabel && <span className="flex-1 text-right">{item.label}</span>}
        </button>
      )
    }

    return (
      <Link
        href={item.href!}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
          "outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2",
          isActive
            ? "bg-white/20 text-white shadow-sm"
            : "text-white/80 hover:bg-white/10 hover:text-white",
          !showLabel && "justify-center px-3",
          item.className
        )}
        aria-current={isActive ? "page" : undefined}
        target={item.target}
        rel={item.rel}
      >
        <Icon className="h-5 w-5 shrink-0 text-white/90" />
        {showLabel && (
          <>
            <span className="flex-1 text-right">{item.label}</span>
            {/* {!isActive && <ChevronRight className="h-4 w-4 text-muted-foreground" />} */}
          </>
        )}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={cn(
          "fixed top-4 right-4 z-50 md:hidden",
          "p-2 rounded-xl bg-white shadow-lg",
          "transition-all duration-200",
          "hover:scale-105 active:scale-95"
        )}
        aria-expanded={isMobileOpen}
        aria-label="فتح/إغلاق القائمة"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed right-0 top-0 z-40 h-screen group",
          "bg-gradient-to-br from-primary to-primary/80 rounded-l-xl shadow-lg",
          "transition-all duration-300 ease-out",
          "overflow-hidden",
          isMobileOpen ? "translate-x-0 w-72" : "translate-x-full md:translate-x-0",
          isOpen && "w-72"
          // isOpen ? "w-72" : "w-20"
        )}
        dir="rtl"
        aria-label="القائمة الجانبية"
      >
        {/* Background Logo */}
        <div className="absolute top-0 right-0 opacity-50 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none">
          <Logo width={300} height={300} className="opacity-20 hover:rotate-45 translate-x-1/4 -translate-y-1/4" />
        </div>

        <div className="relative z-10 flex h-full flex-col md:p-2">
          {/* Logo and Toggle Button */}
          <div className={cn(
            "mb-8 ",
            isOpen ? "flex items-center justify-between gap-2 p-2" : "flex flex-col items-center gap-3 p-2"
          )}>
            <Link href="/dashboard" className="flex items-center flex-1 justify-center gap-3 transition-transform duration-200 hover:scale-105">
              <LogoWhite width={100} height={100} />
              {/* <span className="text-xl font-bold text-foreground">أجار</span> */}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-6 overflow-y-auto h-full justify-between p-4 flex flex-col">
            {/* Menu Section */}
            <div className="space-y-2">
              {/* {isOpen && (<h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-white/70" aria-label="قسم القائمة">
                القائمة
              </h3>
              )} */}
              <div className="space-y-1" role="list">
                {menuItems.map((item, index) => (
                  <NavItem key={item.href || item.label} item={item} showLabel={true} index={index} />
                ))}
              </div>
            </div>

            {/* General Section */}
            <div className="space-y-2 pt-4 border-t border-white/20">
              {/* {isOpen && (<h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-white/70" aria-label="قسم عام">
                عام
              </h3>
              )} */}
              <div className="space-y-1" role="list">
                {generalItems.map((item, index) => (
                  <NavItem key={item.href || item.label} item={item} showLabel={true} index={index} />
                ))}
              </div>
            </div>

          </nav>
        </div>
      </aside >

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )
      }
    </>
  )
}
