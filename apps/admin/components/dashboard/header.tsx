"use client"

import { Bell, Download, Calendar, ChevronDown, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface HeaderProps {
  onMenuToggle?: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between",
        "bg-card rounded-3xl m-4 mb-0",
        "px-4 md:px-6 shadow-lg",
        "transition-all duration-200"
      )}
      dir="rtl"
    >
      {/* Left - Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">لوحة التحكم</h1>
      </div>


      {/* Right - Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-white" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
