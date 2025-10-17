"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b border-border bg-background px-6">
      {/* Search */}
      {/* <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="بحث..." className="w-full pr-10" />
        </div>
      </div> */}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
          <div className="text-right">
            <p className="text-sm font-medium">أحمد محمد</p>
            <p className="text-xs text-muted-foreground">مدير النظام</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary" />
        </div>
      </div>
    </header>
  )
}
