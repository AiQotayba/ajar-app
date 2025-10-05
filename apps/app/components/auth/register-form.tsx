"use client"

import { useState } from "react"
import { ChevronRight, User, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">إنشاء حساب</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
          asChild
        >
          <Link href="/">
            <ChevronRight className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 space-y-6 shadow-xl">
        {/* Drag Handle */}
        <div className="flex justify-center">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>

        {/* Welcome Text */}
        <p className="text-center text-sm text-muted-foreground leading-relaxed">
          أنشئ حسابك الآن وابدأ بإضافة إعلاناتك واستمتع بتجربة بحث وحجز سريعة ومرونة.
        </p>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              الاسم
            </Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Ahmad-Alahmad"
                className="h-14 pr-12 rounded-2xl bg-primary-light border-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              رقم الهاتف
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="+90 000 000 00 00"
                className="h-14 pr-12 rounded-2xl border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              كلمة المرور
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="**************"
                className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              تأكيد كلمة المرور
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="**************"
                className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg">
          إنشاء حساب
        </Button>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
