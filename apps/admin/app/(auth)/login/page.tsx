"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Phone, Lock } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi } from "@/lib/auth"
import { AuthLayout } from "@/components/auth/auth-layout"
import Link from "next/link"
import "react-phone-number-input/style.css"
import "@/styles/phone-input.css"
import { getFCMToken } from "@/lib/firebase"

interface LoginFormData {
  phone: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [deviceToken, setDeviceToken] = React.useState<string | null>(null)

  // الحصول على FCM Token عند تحميل المكون
  React.useEffect(() => {
    const getDeviceToken = async () => {
      try {
        const token = await getFCMToken()
        setDeviceToken(token)
      } catch (error) {
        console.error('Error getting FCM token:', error)
      }
    }

    getDeviceToken()
  }, [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      phone: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      // التأكد من وجود FCM Token
      let finalDeviceToken = deviceToken
      if (!finalDeviceToken) {
        finalDeviceToken = await getFCMToken()
      }

      const response = await authApi.login({
        phone: data.phone,
        password: data.password,
        role: "admin",
        device_token: finalDeviceToken || undefined,  // ✅ FCM Token
      })

      if (response.success) {
        if (response.message) {
          toast.success(response.message)
        } else {
          toast.success("تم تسجيل الدخول بنجاح")
        }

        router.push("/dashboard")
        router.refresh()
      } else {
        if (response.key === "auth.account_not_verified") {
          toast.error("حسابك غير مفعّل. الرجاء التحقق من رقم هاتفك.")
        } else if (response.key === "auth.invalid_credentials") {
          toast.error("رقم الهاتف أو كلمة المرور غير صحيحة")
        } else if (response.key === "auth.account_inactive") {
          toast.error("حسابك غير نشط. الرجاء التواصل مع الإدارة.")
        } else {
          toast.error(response.message || "فشل تسجيل الدخول")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="تسجيل الدخول" subtitle="مرحباً بك في لوحة تحكم أجار">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="••••••••"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register("password", {
                required: "كلمة المرور مطلوبة",
                minLength: {
                  value: 6,
                  message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
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
        </div>

        {/* Forgot Password Link */}
        <div className="text-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline font-medium"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
    </AuthLayout>
  )
}
