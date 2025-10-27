import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AboutContent } from '@/components/about/about-content'

interface AboutPageProps {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'ar' ? 'ar_SY' : 'en_SY',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      canonical: `https://ajar.com/${locale}/about`,
      languages: {
        'ar': 'https://ajar.com/ar/about',
        'en': 'https://ajar.com/en/about',
      },
    },
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  
  return <AboutContent locale={locale} />
}