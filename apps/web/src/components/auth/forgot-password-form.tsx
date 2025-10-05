"use client"

import { useState } from "react"
import { ChevronRight, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [method, setMethod] = useState<"phone" | "email">("phone")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">نسيت كلمة المرور</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white"
          asChild
        >
          <Link href="/login">
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

        {/* Description */}
        <p className="text-center text-sm text-muted-foreground leading-relaxed">
          لا تقلق! أدخل رقم هاتفك أو بريدك الإلكتروني المسجل وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور
        </p>

        {/* Method Selection */}
        <div className="flex gap-3">
          <button
            onClick={() => setMethod("phone")}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              method === "phone"
                ? "border-primary bg-primary-light text-primary font-medium"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            رقم الهاتف
          </button>
          <button
            onClick={() => setMethod("email")}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
              method === "email"
                ? "border-primary bg-primary-light text-primary font-medium"
                : "border-border bg-background text-muted-foreground"
            }`}
          >
            البريد الإلكتروني
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {method === "phone" ? (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                رقم الهاتف
              </Label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+90 000 000 00 00"
                  className="h-14 pr-12 text-start rounded-2xl border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="h-14 pr-12 text-start rounded-2xl border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg">
          إرسال رمز التحقق
        </Button>

        {/* Back to Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          تذكرت كلمة المرور؟{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
