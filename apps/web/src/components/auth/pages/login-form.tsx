"use client"

import { PasswordIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { handleAuthResponse } from "@/lib/auth/client"
import { ChevronRight, Eye, EyeOff, Phone } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import { AuthLayout } from "../authLayout"
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '@/styles/phone-input.css'
import { getFCMToken } from "@/lib/firebase"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()

  // الحصول على FCM Token عند تحميل المكون
  useEffect(() => {
    const getDeviceToken = async () => {
      try {
        const token = await getFCMToken()
        setDeviceToken(token)
      } catch (error) {
      }
    }

    getDeviceToken()
  }, [])

  const { register, handleSubmit, control, formState: { errors }, } = useForm({
    defaultValues: { phone: '', password: '' }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      // التأكد من وجود FCM Token
      let finalDeviceToken = deviceToken
      if (!finalDeviceToken) {
        finalDeviceToken = await getFCMToken()
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          phone: data.phone,
          password: data.password,
          role: 'user',
          device_token: finalDeviceToken  // ✅ FCM Token
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'language': locale
        }
      })
      const responseData = await response.json()

      // Check if login was successful
      if (responseData.success && responseData.access_token) {
        // Check if user account is verified
        if (responseData.data?.phone_verified === false) {
          // Account not verified, redirect to OTP verification
          toast.info(t('auth.login.accountNotVerified'))

          // Store temp user data and OTP info in sessionStorage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('temp_user_data', JSON.stringify(responseData.data))
            if (responseData.info) {
              sessionStorage.setItem('otp_info', JSON.stringify(responseData.info))
            }
          }

          // Redirect to OTP page with phone, type, and expire params
          const otpExpiry = responseData.info?.otp_expire_at
          router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(data.phone)}&type=login${otpExpiry ? `&expire=${encodeURIComponent(otpExpiry)}` : ''}`)
        } else {
          // Account is verified and active, proceed with login
          handleAuthResponse(responseData)
          toast.success(t('auth.login.loginSuccess'))
          location.reload()
        }
      } else {
        // Check if account is not verified (different error format)
        if (responseData.key === 'auth.account_not_verified') {
          toast.info(t('auth.login.accountNotVerified'))

          // Store temp user data and OTP info in sessionStorage
          if (typeof window !== 'undefined') {
            if (responseData.data) {
              sessionStorage.setItem('temp_user_data', JSON.stringify(responseData.data))
            }
            if (responseData.info) {
              sessionStorage.setItem('otp_info', JSON.stringify(responseData.info))
            }
          }

          // Redirect to OTP page with phone, type, and expire params
          const otpExpiry = responseData.info?.otp_expire_at
          router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(data.phone)}&type=login${otpExpiry ? `&expire=${encodeURIComponent(otpExpiry)}` : ''}`)
        } else {
          // Login failed, show error message
          const errorMessage = responseData.message || t('auth.login.loginError')
          toast.error(errorMessage)
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || t('auth.login.loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            {t('auth.login.phone')}
          </Label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: t('auth.login.phoneRequired'),
              validate: (value) => {
                if (!value) return t('auth.login.phoneRequired')
                if (!isValidPhoneNumber(value)) return t('auth.login.invalidPhone')
                return true
              }
            }}
            render={({ field }) => (
              <div className="relative">
                <Phone className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <PhoneInput
                  {...field}
                  international
                  defaultCountry="SY"
                  placeholder={t('auth.login.phone')}
                  className="h-14 rtl:pl-10 ltr:pr-10 rounded-2xl border border-border focus-within:border-primary text-foreground [&_input]:h-14 [&_input]:rounded-2xl [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4"
                />
              </div>
            )}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{t(errors.phone.message || 'auth.login.phoneRequired')}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            {t('auth.login.password')}
          </Label>
          <div className="relative">
            <PasswordIcon className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="**************"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register('password', {
                required: t('auth.login.passwordRequired'),
                minLength: {
                  value: 6,
                  message: t('auth.login.passwordMinLength')
                }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{t(errors.password.message || 'auth.login.passwordRequired')}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-end">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
            {t('auth.login.forgotPassword')}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full  rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? t('common.loading') : t('auth.login.loginButton')}
        </Button>
      </form>

      {/* Register Link */}
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.login.noAccount')}{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          {t('auth.login.signUp')}
        </Link>
      </p>
    </AuthLayout>
  )
}
