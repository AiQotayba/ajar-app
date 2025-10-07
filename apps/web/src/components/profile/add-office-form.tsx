"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ImagePlus, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function AddOfficeForm() {
  const [image, setImage] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/profile">
          <Button variant="outline" size="icon" className="rounded-2xl bg-transparent">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">إضافة مكتب</h1>
        <div className="w-10" />
      </header>

      <div className="p-6 space-y-6">
        {/* Image Upload */}
        <div className="flex justify-center">
          <label
            htmlFor="office-image"
            className="w-64 h-64 bg-primary/10 border-2 border-primary border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden"
          >
            {image ? (
              <img src={image || "/images/placeholder.svg"} alt="Office" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImagePlus className="h-12 w-12 text-primary" />
                <span className="text-primary font-medium">انقر لإضافة صور</span>
              </>
            )}
          </label>
          <input id="office-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Office Name */}
        <div className="space-y-2">
          <Label htmlFor="office-name" className="text-right block">
            اسم المكتب
          </Label>
          <Input id="office-name" placeholder="أدخل اسم المكتب" className="h-14 rounded-2xl text-right" />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-right block">
            رقم الهاتف
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              placeholder="+90 000 000 00 00"
              className="h-14 pr-4 pl-12 rounded-2xl text-right"
            />
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-right block">
            الوصف
          </Label>
          <Textarea
            id="description"
            placeholder="أدخل وصفًا قصيرًا"
            className="min-h-32 rounded-2xl text-right resize-none"
          />
        </div>

        {/* Save Button */}
        <Button className="w-full h-14 text-lg rounded-2xl mt-8">حفظ</Button>
      </div>
    </div>
  )
}
