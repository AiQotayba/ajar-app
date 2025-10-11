"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, User, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale, useTranslations } from "next-intl"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"
import { api } from "@/lib/api"
import { AuthLayout } from "../authLayout"
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '@/styles/phone-input.css'
import { PasswordIcon } from "@/components/icons"
import { handleAuthResponse } from "@/lib/auth/client"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      password_confirmation: ''
    }
  })

  const password = watch('password')

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          password: data.password,
          password_confirmation: data.password_confirmation,
          avatar: 'avatars/default_avatar.jpg'
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'language': locale
        }
      })
      
      const responseData = await response.json()

      if (responseData.success) {
        // Check if we got OTP info
        if (responseData.key === 'auth.we_sent_verification_code_to_your_phone') {
          toast.success(responseData.message || t('auth.register.registerSuccess'))
          
          // Store user data temporarily (no access_token yet, will get it after OTP verification)
          if (responseData.data) {
            // Store user data in sessionStorage for OTP verification
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('temp_user_data', JSON.stringify(responseData.data))
              sessionStorage.setItem('otp_info', JSON.stringify(responseData.info))
            }
          }

          // Redirect to OTP page with phone number and OTP expiry info
          const otpExpiry = responseData.info?.otp_expire_at
          router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(data.phone)}&type=register${otpExpiry ? `&expire=${encodeURIComponent(otpExpiry)}` : ''}`)
        } else {
          toast.success(t('auth.register.registerSuccess'))
          router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(data.phone)}&type=register`)
        }
      } else {
        if (responseData.key === 'auth.phone_number_already_exists') {
          toast.error(t('auth.register.phoneExists'))
        } else {
          toast.error(responseData.message || t('auth.register.registerError'))
        }
      }
    } catch (error: any) {
      console.error('Register error:', error)
      toast.error(error.message || t('auth.register.registerError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
        {/* First Name Field */}
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-sm font-medium text-foreground">
            {t('auth.register.firstName')}
          </Label>
          <div className="relative">
            <User className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="first_name"
              type="text"
              placeholder={t('auth.register.firstName')}
              className="h-14 ltr:pl-12 rtl:pr-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register('first_name', {
                required: t('auth.register.firstNameRequired'),
                minLength: {
                  value: 2,
                  message: t('auth.register.firstNameMinLength')
                }
              })}
            />
          </div>
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name.message as string}</p>
          )}
        </div>

        {/* Last Name Field */}
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-sm font-medium text-foreground">
            {t('auth.register.lastName')}
          </Label>
          <div className="relative">
            <User className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="last_name"
              type="text"
              placeholder={t('auth.register.lastName')}
              className="h-14 ltr:pl-12 rtl:pr-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register('last_name', {
                required: t('auth.register.lastNameRequired'),
                minLength: {
                  value: 2,
                  message: t('auth.register.lastNameMinLength')
                }
              })}
            />
          </div>
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name.message as string}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            {t('auth.register.phone')}
          </Label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: t('auth.register.phoneRequired'),
              validate: (value) => {
                if (!value) return t('auth.register.phoneRequired')
                if (!isValidPhoneNumber(value)) return t('auth.register.invalidPhone')
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
                  placeholder={t('auth.register.phone')}
                  className="h-14 rtl:pl-10 ltr:pr-10 rounded-2xl border border-border focus-within:border-primary text-foreground [&_input]:h-14 [&_input]:rounded-2xl [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4"
                />
              </div>
            )}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message as string}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            {t('auth.register.password')}
          </Label>
          <div className="relative">
            <PasswordIcon className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="**************"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register('password', {
                required: t('auth.register.passwordRequired'),
                minLength: {
                  value: 6,
                  message: t('auth.register.passwordMinLength')
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
            {t('auth.register.confirmPassword')}
          </Label>
          <div className="relative">
            <PasswordIcon className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="**************"
              className="h-14 px-12 rounded-2xl border-border focus:border-primary text-foreground"
              {...register('password_confirmation', {
                required: t('auth.register.confirmPasswordRequired'),
                validate: (value) => value === password || t('auth.register.passwordsNotMatch')
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
          {isLoading ? t('common.loading') : t('auth.register.registerButton')}
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-muted-foreground mb-28">
        {t('auth.register.haveAccount')}{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {t('auth.register.signIn')}
        </Link>
      </p>
    </AuthLayout>
  )
}
