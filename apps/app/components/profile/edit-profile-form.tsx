"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EditProfileForm() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/profile">
          <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">تعديل بيانات الحساب</h1>
        <div className="w-10" />
      </header>

      <div className="p-6 space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-right block">
            الاسم
          </Label>
          <Input id="name" defaultValue="أحمد الأحمد" className="h-14 rounded-2xl text-right" />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-right block">
            رقم الهاتف
          </Label>
          <Input id="phone" type="tel" defaultValue="+90 000 000 00 00" className="h-14 rounded-2xl text-right" />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-right block">
            البريد الإلكتروني
          </Label>
          <Input id="email" type="email" placeholder="example@email.com" className="h-14 rounded-2xl text-right" />
        </div>

        {/* Save Button */}
        <Button className="w-full h-14 text-lg rounded-2xl mt-8">حفظ</Button>
      </div>
    </div>
  )
}
