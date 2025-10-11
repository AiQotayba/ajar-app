"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Phone, ArrowLeft } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi, storeOtpInfo } from "@/lib/auth"
import { AuthLayout } from "@/components/auth/auth-layout"
import Link from "next/link"
import "react-phone-number-input/style.css"
import "@/styles/phone-input.css"

interface ForgotPasswordFormData {
  phone: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      phone: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await authApi.forgotPassword({ phone: data.phone })

      if (response.success) {
        // Store OTP info in sessionStorage
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
        storeOtpInfo({
          phone: data.phone,
          type: "reset",
          expiresAt,
        })

        // Show success message
        if (response.message) {
          toast.success(response.message)
        } else {
          toast.success("تم إرسال رمز التحقق إلى هاتفك")
        }

        // Redirect to verify-otp page
        router.push(
          `/verify-otp?phone=${encodeURIComponent(data.phone)}&type=reset&expire=${expiresAt}`
        )
      } else {
        if (response.key === "auth.phone_not_found") {
          toast.error("رقم الهاتف غير مسجل في النظام")
        } else {
          toast.error(response.message || "فشل إرسال رمز التحقق")
        }
      }
    } catch (error: any) {
      console.error("Forgot password error:", error)
      toast.error(error.message || "حدث خطأ أثناء إرسال رمز التحقق")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="نسيت كلمة المرور؟" subtitle="أدخل رقم هاتفك لإرسال رمز التحقق">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            رقم الهاتف
          </Label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: "رقم الهاتف مطلوب",
              validate: (value) => {
                if (!value) return "رقم الهاتف مطلوب"
                if (!isValidPhoneNumber(value)) return "رقم الهاتف غير صحيح"
                return true
              },
            }}
            render={({ field }) => (
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                <PhoneInput
                  {...field}
                  international
                  defaultCountry="SY"
                  placeholder="رقم الهاتف"
                  className="h-14 pl-4 pr-12 rounded-2xl border border-border focus-within:border-primary text-foreground [&_input]:h-14 [&_input]:rounded-2xl [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4"
                />
              </div>
            )}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            سنرسل لك رمز تحقق مكون من 4 أرقام
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
