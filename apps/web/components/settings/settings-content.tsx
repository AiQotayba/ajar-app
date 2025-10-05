"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function SettingsContent() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/profile">
          <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">الإعدادات</h1>
        <div className="w-10" />
      </header>

      <div className="p-6 space-y-4">
        {/* Notifications Toggle */}
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border">
          <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          <span className="font-medium">إشعارات التطبيق</span>
        </div>

        {/* Language Selector */}
        <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border hover:bg-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">اللغة (العربية)</span>
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M2 12H22M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </button>

        {/* About App */}
        <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border hover:bg-accent transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">عن التطبيق</span>
            <Info className="h-5 w-5 text-muted-foreground" />
          </div>
        </button>
      </div>
    </div>
  )
}
