"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale, useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"
import { AuthLayout } from "../authLayout"
import { PasswordIcon } from "@/components/icons"
import { handleAuthResponse } from "@/lib/auth/client"

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations()
  const locale = useLocale()

  // قراءة رقم الهاتف والتحقق من التوكن المؤقت
  useEffect(() => {
    const urlPhone = searchParams.get('phone')

    if (typeof window !== 'undefined') {
      // Check for temp_token from OTP verification
      const tempToken = sessionStorage.getItem('temp_token')
      const resetPasswordFlow = sessionStorage.getItem('reset_password_flow')
      
      // If no temp token or not in reset flow, redirect to login
      if (!tempToken || resetPasswordFlow !== 'true') {
        toast.error(t('auth.resetPassword.invalidSession'))
        router.push(`/${locale}/login`)
        return
      }

      // Get phone from URL or sessionStorage
      if (urlPhone) {
        setPhone(urlPhone)
      } else {
        const storedPhone = sessionStorage.getItem('reset_phone')
        if (storedPhone) {
          setPhone(storedPhone)
        } else {
          toast.error(t('auth.resetPassword.phoneRequired'))
          router.push(`/${locale}/login`)
        }
      }
    }
  }, [searchParams, router, locale, t])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      password_confirmation: ''
    }
  })

  const password = watch('password')

  const onSubmit = async (data: any) => {
    if (!phone) {
      toast.error(t('auth.resetPassword.phoneRequired'))
      return
    }

    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      
      // Get temporary token from sessionStorage
      const tempToken = typeof window !== 'undefined' ? sessionStorage.getItem('temp_token') : null
      
      if (!tempToken) {
        toast.error(t('auth.resetPassword.invalidSession'))
        router.push(`/${locale}/login`)
        return
      }
      
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({
          password: data.password,
          password_confirmation: data.password_confirmation
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
          'language': locale
        }
      })
      
      const responseData = await response.json()

      if (responseData.success) {
        // Clear sessionStorage including temp_token and reset flow markers
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('temp_user_data')
          sessionStorage.removeItem('otp_info')
          sessionStorage.removeItem('temp_token')
          sessionStorage.removeItem('reset_password_flow')
          sessionStorage.removeItem('reset_phone')
        }

        // Automatic login after successful password reset
        try {
          const loginResponse = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              phone: phone,
              password: data.password,
              role: 'user'
            }),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'language': locale
            }
          })
          
          const loginData = await loginResponse.json()

          if (loginData.success && loginData.access_token) {
            // Save auth data and redirect to home
            handleAuthResponse(loginData)
            toast.success(t('auth.resetPassword.resetSuccessAndLogin'))
            router.push(`/${locale}/`)
          } else {
            // Password reset succeeded but auto-login failed
            toast.success(t('auth.resetPassword.resetSuccess'))
            router.push(`/${locale}/login`)
          }
        } catch (loginError) {
          // Password reset succeeded but auto-login failed
          toast.success(t('auth.resetPassword.resetSuccess'))
          router.push(`/${locale}/login`)
        }
      } else {
        toast.error(responseData.message || t('auth.resetPassword.resetError'))
      }
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error.message || t('auth.resetPassword.resetError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.resetPassword.title')} subtitle={t('auth.resetPassword.subtitle')}>

      {/* Phone Display */}
      {phone && (
        <p className="text-center text-sm font-medium text-foreground" dir="ltr">
          {phone}
        </p>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            {t('auth.resetPassword.newPassword')}
          </Label>
          <div className="relative">
            <PasswordIcon className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="**************"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register('password', {
                required: t('auth.resetPassword.passwordRequired'),
                minLength: {
                  value: 6,
                  message: t('auth.resetPassword.passwordMinLength')
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
            <p className="text-sm text-red-500">{errors.password.message as string}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground">
            {t('auth.resetPassword.confirmPassword')}
          </Label>
          <div className="relative">
            <PasswordIcon className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="**************"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register('password_confirmation', {
                required: t('auth.resetPassword.confirmPasswordRequired'),
                validate: (value) => value === password || t('auth.resetPassword.passwordsNotMatch')
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-sm text-red-500">{errors.password_confirmation.message as string}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? t('common.loading') : t('auth.resetPassword.resetButton')}
        </Button>
      </form>

      {/* Back to Login Link */}
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.forgotPassword.backToLogin')}{" "}
        <Link href={`/${locale}/login`} className="text-primary hover:underline font-medium">
          {t('auth.login.loginButton')}
        </Link>
      </p>
    </AuthLayout>
  )
}
