"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi, getOtpInfo, clearOtpInfo, tokenManager } from "@/lib/auth"
import { AuthLayout } from "@/components/auth/auth-layout"
import Cookies from "js-cookie"

interface ResetPasswordFormData {
  password: string
  password_confirmation: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  // Get phone from URL or sessionStorage
  const phone = searchParams.get("phone") || getOtpInfo()?.phone || ""

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  })

  const password = watch("password")
  const passwordConfirmation = watch("password_confirmation")
  const passwordsMatch = password && passwordConfirmation && password === passwordConfirmation

  // Check if temp token exists
  React.useEffect(() => {
    const tempToken = tokenManager.getTempToken()
    console.log(tempToken)
    if (!tempToken) {
      toast.error("جلسة التحقق منتهية. الرجاء البدء من جديد")
      router.push("/forgot-password")
    }
  }, [router])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!phone) {
      toast.error("رقم الهاتف مفقود")
      router.push("/forgot-password")
      return
    }

    if (data.password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
      return
    }

    if (data.password !== data.password_confirmation) {
      toast.error("كلمات المرور غير متطابقة")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.resetPassword({
        phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      console.log(response)
      if (response.success) {
        // Clear OTP info and temp token
        clearOtpInfo()
        Cookies.remove('ajar_admin_temp_token')
        sessionStorage.removeItem("otp_info")

        // Automatic login after successful password reset
        try {
          const loginResponse = await authApi.login({
            phone: phone,
            password: data.password,
            role: "admin",
          })

          if (loginResponse.success) {
            // Show success message
            toast.success("تم تغيير كلمة المرور وتسجيل الدخول بنجاح")
            
            // Redirect to dashboard (already logged in automatically)
            router.push("/dashboard")
            router.refresh()
          } else {
            // Password reset succeeded but auto-login failed
            toast.success("تم تغيير كلمة المرور بنجاح. الرجاء تسجيل الدخول")
            router.push("/login")
          }
        } catch (loginError) {
          // Password reset succeeded but auto-login failed
          toast.success("تم تغيير كلمة المرور بنجاح. الرجاء تسجيل الدخول")
          router.push("/login")
        }
      } else {
        if (response.key === "auth.token_expired") {
          toast.error("انتهت صلاحية الجلسة. الرجاء البدء من جديد")
          router.push("/forgot-password")
        } else {
          toast.error(response.message || "فشل تغيير كلمة المرور")
        }
      }
    } catch (error: any) {
      console.error("Reset password error:", error)
      toast.error(error.message || "حدث خطأ أثناء تغيير كلمة المرور")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="تعيين كلمة مرور جديدة" subtitle="أدخل كلمة المرور الجديدة لحسابك">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            كلمة المرور الجديدة
          </Label>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register("password", {
                required: "كلمة المرور مطلوبة",
                minLength: {
                  value: 8,
                  message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            يجب أن تحتوي على 8 أحرف على الأقل
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground">
            تأكيد كلمة المرور
          </Label>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register("password_confirmation", {
                required: "تأكيد كلمة المرور مطلوب",
                validate: (value) =>
                  value === password || "كلمات المرور غير متطابقة",
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>
          )}
          {password && passwordConfirmation && (
            <div className="flex items-center gap-2 text-sm">
              {passwordsMatch ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">كلمات المرور متطابقة</span>
                </>
              ) : (
                <span className="text-destructive">✗ كلمات المرور غير متطابقة</span>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !passwordsMatch}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? "جاري التحديث..." : "تأكيد كلمة المرور"}
        </Button>
      </form>
    </AuthLayout>
  )
}
