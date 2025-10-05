"use client"

import { useState } from "react"
import { ChevronRight, User, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
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
          مرحباً بعودتك! سجل دخولك لمتابعة كل تفاصيل عقاراتك بسهولة وسرعة وأمان
        </p>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              الاسم
            </Label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
              <Input
                id="name"
                type="text"
                placeholder="Ahmad-Alahmad"
                className="h-14 pr-12 rounded-2xl bg-primary-light border-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              رقم الهاتف
            </Label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+90 000 000 00 00"
                className="h-14 pr-12 text-start rounded-2xl border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              كلمة المرور
            </Label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="**************"
                className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-left">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg">
          تسجيل الدخول
        </Button>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  )
}
