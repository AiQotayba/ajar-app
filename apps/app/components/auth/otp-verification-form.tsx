"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function OTPVerificationForm() {
  const [otp, setOtp] = useState(["", "", "", ""])
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">التحقق من رقم الهاتف</h1>
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

        {/* Instructions */}
        <p className="text-center text-sm text-muted-foreground leading-relaxed">
          أدخل رمز التحقق المرسل إلى رقمك لإتمام تسجيل الدخول.
        </p>

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-3 dir-ltr">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-16 w-16 text-center text-2xl font-bold rounded-2xl border-2 border-border focus:border-primary bg-primary-light/30"
            />
          ))}
        </div>

        {/* Resend Link */}
        <div className="text-center">
          <button className="text-sm text-primary hover:underline font-medium">إعادة إرسال الرمز</button>
        </div>

        {/* Submit Button */}
        <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg">
          تحقق
        </Button>
      </div>
    </div>
  )
}
