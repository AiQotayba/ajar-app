import { Metadata } from 'next'
import type React from 'react'
import '@/app/[locale]/globals.css'

interface LayoutProps {
  params: Promise<{
    locale: string
    page: string
  }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale, page } = await params
  
  const pageTitles: Record<string, { ar: string; en: string }> = {
    policy: {
      ar: 'سياسة الخصوصية',
      en: 'Privacy Policy'
    },
    terms: {
      ar: 'الشروط والأحكام',
      en: 'Terms and Conditions'
    }
  }

  const title = pageTitles[page]?.[locale as 'ar' | 'en'] || page
  const description = locale === 'ar' 
    ? `${title} لتطبيق أجار - منصة العقارات`
    : `${title} for Ajar App - Real Estate Platform`

  return {
    title: `${title} | أجار`,
    description,
    openGraph: {
      title: `${title} | أجار`,
      description,
      type: 'website',
      locale: locale === 'ar' ? 'ar_SY' : 'en_SY',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | أجار`,
      description,
    },
    alternates: {
      canonical: `https://ajar.com/${locale}/${page}`,
    },
  }
}

export default async function PageLayout({ children }: LayoutProps) {
  return <>{children}</>
}

