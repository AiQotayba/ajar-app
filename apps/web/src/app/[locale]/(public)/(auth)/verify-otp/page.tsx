import { OTPVerificationForm } from "@/components/auth/pages/otp-verification-form"
import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Suspense } from "react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.verifyOtp' })
  
  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('subtitle'),
    },
  }
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerificationForm />
    </Suspense>
  )
}
