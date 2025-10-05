"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Menu } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  title: string
  showNotification?: boolean
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showNotification, showBack, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg ">
      <div className="flex items-center justify-between px-4 py-4">
        {showBack ? (
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <h1 className="text-xl font-bold text-foreground">{title}</h1>

        {showNotification ? (
          <Link href="/notifications" className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10">
              <Bell className="h-5 w-5 text-foreground" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
              3
            </Badge>
          </Link>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  )
}
