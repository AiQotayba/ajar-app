"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLocale, useTranslations } from "next-intl"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import Link from "next/link"
import { AuthLayout } from "../authLayout"
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import '@/styles/phone-input.css' 
export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: ''
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({
          phone: data.phone
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'language': locale
        }
      })
      
      const responseData = await response.json()
      
      if (responseData.success) {
        toast.success(responseData.message || t('auth.forgotPassword.codeSent'))
        
        // Store OTP info and reset password flag in sessionStorage
        if (typeof window !== 'undefined') {
          // Mark that we're in password reset flow
          sessionStorage.setItem('reset_password_flow', 'true')
          
          // Store phone number for later use
          sessionStorage.setItem('reset_phone', data.phone)
          
          // Store OTP info if provided
          if (responseData.info) {
            sessionStorage.setItem('otp_info', JSON.stringify(responseData.info))
          }
        }

        // Redirect to OTP page with phone, type, and expire params
        const otpExpiry = responseData.info?.otp_expire_at
        router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(data.phone)}&type=reset${otpExpiry ? `&expire=${encodeURIComponent(otpExpiry)}` : ''}`)
      } else {
        toast.error(responseData.message || t('auth.forgotPassword.sendError'))
      }
    } catch (error: any) {
      console.error('Forgot password error:', error)
      toast.error(error.message || t('auth.forgotPassword.sendError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <AuthLayout title={t('auth.forgotPassword.title')} subtitle={t('auth.forgotPassword.subtitle')}>

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-foreground">
            {t('auth.forgotPassword.phone')}
          </Label>
          <Controller
            name="phone"
            control={control}
            rules={{
              required: t('auth.forgotPassword.phoneRequired'),
              validate: (value) => {
                if (!value) return t('auth.forgotPassword.phoneRequired')
                if (!isValidPhoneNumber(value)) return t('auth.forgotPassword.invalidPhone')
                return true
              }
            }}
            render={({ field }) => (
              <div className="relative">
                <Phone className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <PhoneInput
                  {...field}
                  international
                  defaultCountry="SY"
                  placeholder={t('auth.forgotPassword.phone')}
                  className="h-14 ltr:pl-10 rtl:pr-10 rounded-2xl border border-border focus-within:border-primary text-foreground [&_input]:h-14 [&_input]:rounded-2xl [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-4 [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_.PhoneInputCountry]:px-4"
                />
              </div>
            )}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message as string}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? t('common.loading') : t('auth.forgotPassword.sendCode')}
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
