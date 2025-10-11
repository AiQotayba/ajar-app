"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Shield, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "sonner"
import { authApi, getOtpInfo, clearOtpInfo } from "@/lib/auth"
import { AuthLayout } from "@/components/auth/auth-layout"
import Link from "next/link"

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isResending, setIsResending] = React.useState(false)
  const [otp, setOtp] = React.useState("")
  const [timeLeft, setTimeLeft] = React.useState(300) // 5 minutes in seconds

  // Get phone and type from URL params or sessionStorage
  const phone = searchParams.get("phone") || getOtpInfo()?.phone || ""
  const type = (searchParams.get("type") as "activate" | "reset") || getOtpInfo()?.type || "reset"

  // Timer countdown
  React.useEffect(() => {
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle verify
  const handleVerify = async () => {
    if (otp.length !== 4) {
      toast.error("الرجاء إدخال رمز التحقق المكون من 4 أرقام")
      return
    }

    if (!phone) {
      toast.error("رقم الهاتف مفقود")
      router.push("/forgot-password")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.verifyOtp({ phone, otp })
      console.log(response)
      if (response.success) {
        // Show success message
        if (response.message) {
          toast.success(response.message)
        } else {
          toast.success("تم التحقق بنجاح")
        }

        // Redirect based on type
        if (type === "reset") {
          // Go to reset password page
          router.push(`/reset-password?phone=${encodeURIComponent(phone)}`)
        } else {
          // Activate account - redirect to dashboard
          clearOtpInfo()
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        if (response.key === "auth.invalid_otp") {
          toast.error("رمز التحقق غير صحيح")
        } else if (response.key === "auth.otp_expired") {
          toast.error("رمز التحقق منتهي الصلاحية")
        } else if (response.key === "auth.otp_invalid_or_expired") {
          toast.error("رمز التحقق غير صحيح أو منتهي الصلاحية")
        } else {
          toast.error("فشل التحقق")
        }

        // تفريغ قيمة OTP
        setOtp("")
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error)
      toast.error(error.message || "حدث خطأ أثناء التحقق")
      // تفريغ قيمة OTP
      setOtp("")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend OTP
  const handleResend = async () => {
    if (!phone) {
      toast.error("رقم الهاتف مفقود")
      return
    }

    setIsResending(true)

    try {
      const response = await authApi.forgotPassword({ phone })

      if (response.success) {
        toast.success("تم إرسال رمز تحقق جديد")
        setTimeLeft(300) // Reset timer
        setOtp("") // Clear OTP input
      } else {
        toast.error(response.message || "فشل إرسال رمز التحقق")
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      toast.error(error.message || "حدث خطأ أثناء إعادة الإرسال")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title="التحقق من الهاتف"
      subtitle={
        <>
          أدخل رمز التحقق المرسل إلى
          <br />
          <span className="font-mono font-bold text-foreground">{phone}</span>
        </>
      }
    >
      <div className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-4">
          <div className="flex justify-center" dir="ltr">
            <InputOTP
              maxLength={4}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={isLoading}
              autoFocus
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot index={0} className="h-14 w-14 text-lg rounded-xl border-2" />
                <InputOTPSlot index={1} className="h-14 w-14 text-lg rounded-xl border-2" />
                <InputOTPSlot index={2} className="h-14 w-14 text-lg rounded-xl border-2" />
                <InputOTPSlot index={3} className="h-14 w-14 text-lg rounded-xl border-2" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-muted-foreground">
                ينتهي الرمز خلال:{" "}
                <span className="font-mono font-bold text-primary text-lg">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-destructive font-semibold">انتهت صلاحية الرمز</p>
            )}
          </div>
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          size="lg"
          disabled={isLoading || otp.length !== 4 || timeLeft <= 0}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-base font-bold shadow-lg disabled:opacity-50"
        >
          {isLoading ? "جاري التحقق..." : "تحقق"}
        </Button>

        {/* Resend Button */}
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending || timeLeft > 240} // Can resend after 1 minute
            className="gap-2 text-sm font-medium"
          >
            {isResending ? (
              "جاري الإرسال..."
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                إعادة إرسال الرمز
              </>
            )}
          </Button>
          {timeLeft > 240 && (
            <p className="text-xs text-muted-foreground">
              يمكنك طلب رمز جديد بعد دقيقة واحدة
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            تغيير رقم الهاتف
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
