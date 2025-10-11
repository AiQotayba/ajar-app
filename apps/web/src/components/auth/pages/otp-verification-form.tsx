"use client"

import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { handleAuthResponse } from "@/lib/auth/client"
import { ChevronRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { AuthLayout } from "../authLayout"

export function OTPVerificationForm() {
  const [otpValue, setOtpValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [expiryTime, setExpiryTime] = useState<Date | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations()
  const locale = useLocale()
  const inputLength = 4 // OTP is 4 digits
  
  const [phone, setPhone] = useState('')
  const [type, setType] = useState<'register' | 'reset' | 'login'>('register')

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: '',
      otp: ''
    }
  })

  useEffect(() => {
    const urlPhone = searchParams.get('phone')
    const urlType = searchParams.get('type') as 'register' | 'reset' | 'login' | null
    const urlExpire = searchParams.get('expire')

    // Set phone
    if (urlPhone) {
      setPhone(urlPhone)
      setValue('phone', urlPhone)
    } else if (typeof window !== 'undefined') {
      // Fallback to sessionStorage
      const tempUserData = sessionStorage.getItem('temp_user_data')
      if (tempUserData) {
        try {
          const userData = JSON.parse(tempUserData)
          if (userData.phone) {
            setPhone(userData.phone)
            setValue('phone', userData.phone)
          }
        } catch (e) {
          console.error('Error parsing temp_user_data:', e)
        }
      }
    }

    // Set type
    if (urlType && ['register', 'reset', 'login'].includes(urlType)) {
      setType(urlType)
    }

    // Set expiry time
    if (urlExpire) {
      setExpiryTime(new Date(urlExpire))
    } else if (typeof window !== 'undefined') {
      const otpInfo = sessionStorage.getItem('otp_info')
      if (otpInfo) {
        try {
          const info = JSON.parse(otpInfo)
          if (info.otp_expire_at) {
            setExpiryTime(new Date(info.otp_expire_at))
          }
        } catch (e) {
          console.error('Error parsing otp_info:', e)
        }
      }
    }
  }, [searchParams, setValue])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Timer for OTP expiry display
  useEffect(() => {
    if (!expiryTime) return
    
    const interval = setInterval(() => {
      const now = new Date()
      const diff = expiryTime.getTime() - now.getTime()
      if (diff <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiryTime])

  // Update form value when OTP changes
  useEffect(() => {
    setValue('otp', otpValue)
  }, [otpValue, setValue])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({
          phone: data.phone,
          otp: data.otp
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'language': locale
        }
      })
      
      const responseData = await response.json()

      if (responseData.success && responseData.access_token) {
        toast.success(t('auth.verifyOtp.verifySuccess'))

        // Handle based on type
        if (type === 'reset') {
          // For password reset: save temporary token (not permanent auth)
          if (typeof window !== 'undefined') {
            // Save temporary token for reset password only
            sessionStorage.setItem('temp_token', responseData.access_token)
            // Keep reset_password_flow and reset_phone for reset-password page
            // Don't save to cookies yet - only after successful password reset
          }
          
          // Redirect to reset password page
          router.push(`/${locale}/reset-password`)
        } else {
          // For login/register: save permanent auth data
          handleAuthResponse(responseData)
          
          // Clear sessionStorage
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('temp_user_data')
            sessionStorage.removeItem('otp_info')
          }
          
          // Redirect to home
          router.push(`/${locale}/`)
        }
      } else {
        toast.error(responseData.message || t('auth.verifyOtp.invalidOtp'))
      }
    } catch (error: any) {
      console.error('OTP verification error:', error)
      toast.error(error.message || t('auth.verifyOtp.verifyError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || !phone) return

    setIsResending(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      
      // Determine endpoint based on type
      let endpoint = '/auth/resend-otp'
      if (type === 'reset') {
        endpoint = '/auth/forgot-password'
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ phone }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'language': locale
        }
      })
      
      const responseData = await response.json()

      if (responseData.success) {
        toast.success(responseData.message || t('auth.verifyOtp.codeSent'))
        setCountdown(60) // 60 seconds countdown
        
        // Update expiry time if provided
        if (responseData.info?.otp_expire_at) {
          setExpiryTime(new Date(responseData.info.otp_expire_at))
        }
      } else {
        toast.error(responseData.message || t('auth.verifyOtp.sendError'))
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      toast.error(error.message || t('auth.verifyOtp.sendError'))
    } finally {
      setIsResending(false)
    }
  }

  // Calculate remaining time for OTP expiry
  const getRemainingTime = () => {
    if (!expiryTime) return null
    const now = new Date()
    const diff = expiryTime.getTime() - now.getTime()
    if (diff <= 0) return 'expired'
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const remainingTime = getRemainingTime()

  return (
    <AuthLayout title={t('auth.verifyOtp.title')} subtitle={t('auth.verifyOtp.subtitle')}>

      {/* Phone Display */}
      {phone && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground" dir="ltr">
            {phone}
          </p>
          {remainingTime && remainingTime !== 'expired' && (
            <p className="text-xs text-muted-foreground">
              {t('auth.verifyOtp.expiresIn')}: {remainingTime}
            </p>
          )}
          {remainingTime === 'expired' && (
            <p className="text-xs text-destructive">
              {t('auth.verifyOtp.codeExpired')}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* OTP Input Fields */}
        <div className="flex justify-center">
          <InputOTP
            maxLength={inputLength}
            value={otpValue}
            onChange={(value) => setOtpValue(value)}
            containerClassName="gap-2"
          >
            <InputOTPGroup className="gap-2">
              {[...Array(inputLength)].map((_, index) => (
                <InputOTPSlot
                  key={inputLength - 1 - index}
                  index={inputLength - 1 - index}
                  className="h-14 w-14 text-2xl font-bold rounded-2xl border-2 border-border focus:border-primary bg-primary-light/30"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {errors.otp && (
          <p className="text-sm text-red-500 text-center">{t(errors.otp.message || 'auth.verifyOtp.otpRequired')}</p>
        )}

        {/* Resend Link */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('auth.verifyOtp.resendCode')} ({countdown}s)
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-primary hover:underline font-medium disabled:opacity-50"
            >
              {isResending ? t('common.loading') : t('auth.verifyOtp.resendCode')}
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || otpValue.length !== inputLength}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? t('common.loading') : t('auth.verifyOtp.verify')}
        </Button>
      </form>
    </AuthLayout>
  )
}
