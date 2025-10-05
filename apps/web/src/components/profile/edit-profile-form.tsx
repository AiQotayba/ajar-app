"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "../layout/header"

export function EditProfileForm() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="تعديل بيانات الحساب" showBack />
      

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
