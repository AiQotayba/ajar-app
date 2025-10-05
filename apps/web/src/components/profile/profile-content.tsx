"use client"

import { Button } from "@/components/ui/button"
import { Bell, ChevronLeft, FileText, Lock, Pencil, Settings } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Header } from "../layout/header"
import { OfficeCard } from "./office-card"
const MenuItems = [
  {
    title: "تعديل بيانات الحساب",
    href: "/profile/edit",
    icon: Pencil
  },
  {
    title: "تغيير كلمة المرور",
    href: "/profile/change-password",
    icon: Lock
  },
  {
    title: "إعلاناتي",
    href: "/profile/my-ads",
    icon: FileText
  },
  {
    title: "الإشعارات",
    href: "/notifications",
    icon: Bell
  },
  {
    title: "الإعدادات",
    href: "/settings",
    icon: Settings
  },
]

export function ProfileContent() {
  const [office, setOffice] = useState({
    name: "مكتب الأحمد",
    phone: "+90 000 000 00 00",
    image: "/modern-office-building.png",
    description: "الوصف هنا إن وجد..الوصف هنا إن وجد..الوصف هنا إن وجد..الوصف هنا إن وجد..الوصف هنا إن وجد."
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <Header title="حسابي" showBack />

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20">
              <img src="/professional-man-glasses.png" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <Link href={"/profile/edit"} className="absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Pencil className="h-5 w-5 text-primary-foreground" />
            </Link>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{office.name}</h2>
            <p className="text-muted-foreground mt-1 text-center" dir="ltr">{office.phone}</p>
          </div>
        </div>

        {/* Office Card or Add Button */}
        {office?.name ? <OfficeCard /> : (
          <Link href="/profile/office/add">
            <Button className="w-full h-14 text-lg rounded-2xl">إضافة مكتب</Button>
          </Link>
        )}

        {/* Menu Items */}
        <div className="space-y-2 flex flex-col mt-4">
          {MenuItems.map((item) => (
            <Link href={item.href} className="w-full h-14 px-2 text-lg flex items-center justify-between p-4 bg-card rounded-2xl border transition-colors">
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 mx-2 text-muted-foreground" />
                <span className="font-medium text-sm">{item.title}</span>
              </div>
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <ChevronLeft className="h-5 w-5" />
              </div>
            </Link>
          ))}

        </div>
      </div>
    </div>
  )
}
