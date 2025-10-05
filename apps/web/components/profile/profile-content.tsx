"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Pencil, Bell, Lock, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OfficeCard } from "./office-card"

export function ProfileContent() {
  const [hasOffice, setHasOffice] = useState(true)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">حسابي</h1>
        <div className="w-10" />
      </header>

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20">
              <img src="/professional-man-glasses.png" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Pencil className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">أحمد الأحمد</h2>
            <p className="text-muted-foreground mt-1">+90 000 000 00 00</p>
          </div>
        </div>

        {/* Office Card or Add Button */}
        {hasOffice ? (
          <OfficeCard />
        ) : (
          <Link href="/profile/office/add">
            <Button className="w-full h-14 text-lg rounded-2xl">إضافة مكتب</Button>
          </Link>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          <Link href="/profile/edit">
            <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">تعديل بيانات الحساب</span>
              </div>
              <Pencil className="h-5 w-5 text-muted-foreground" />
            </button>
          </Link>

          <Link href="/profile/change-password">
            <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">تغيير كلمة المرور</span>
              </div>
              <Lock className="h-5 w-5 text-muted-foreground" />
            </button>
          </Link>

          <Link href="/profile/my-ads">
            <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">إعلاناتي</span>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </button>
          </Link>

          <Link href="/notifications">
            <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">الإشعارات</span>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
          </Link>

          <Link href="/settings">
            <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border hover:bg-accent transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">الإعدادات</span>
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
