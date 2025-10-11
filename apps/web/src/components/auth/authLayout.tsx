"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale, useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { api } from "@/lib/api"
import AuthBG from "./AuthBG"

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  
  return (
    <AuthBG>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-2xl border-white border-2 hover:!bg-transparent"
          asChild
          onClick={() => router.back()}
        >
          <ChevronRight className="h-6 w-6 stroke-white ltr:rotate-180 rtl:rotate-0" />
        </Button>
        {/* Header */}
        <div className="flex items-center justify-center gap-2  mb-8">
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="14" y1="2" x2="2" y2="2" stroke="white" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 space-y-6 shadow-xl">
          {/* Drag Handle */}
          <div className="flex justify-center">
            <div className="w-12 h-1 bg-border rounded-full" />
          </div>

          {/* Description */}
          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </AuthBG>
  )
}
