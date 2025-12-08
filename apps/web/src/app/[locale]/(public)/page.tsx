import HomePage from "@/components/home/home";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface HomePageProps {
  params: {
    locale: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'ar' ? 'أجار - منصة الإعلانات في سوريا' : 'Ajar - Syrian Classifieds Platform',
    description: locale === 'ar'
      ? 'منصة شاملة للإعلانات في سوريا. ابحث عن منتجات، خدمات، وظائف، عقارات وأكثر. أو انشر إعلانك للوصول إلى أكبر عدد من العملاء'
      : 'Comprehensive classifieds platform in Syria. Find products, services, jobs, real estate and more. Or post your ad to reach more customers',
    keywords: locale === 'ar'
      ? 'إعلانات سوريا، منصة إعلانات، إعلانات مبوبة، منتجات، خدمات، وظائف، عقارات'
      : 'Syria classifieds, ads platform, classified ads, products, services, jobs, real estate',
    openGraph: {
      title: locale === 'ar' ? 'أجار - منصة الإعلانات في سوريا' : 'Ajar - Syrian Classifieds Platform',
      description: locale === 'ar'
        ? 'منصة شاملة للإعلانات في سوريا'
        : 'Comprehensive classifieds platform in Syria',
      type: 'website',
      locale: locale === 'ar' ? 'ar_SY' : 'en_SY',
      siteName: 'Ajar',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'ar' ? 'أجار - منصة الإعلانات في سوريا' : 'Ajar - Syrian Classifieds Platform',
      description: locale === 'ar'
        ? 'منصة شاملة للإعلانات في سوريا'
        : 'Comprehensive classifieds platform in Syria',
    },
    alternates: {
      canonical: `https://ajar.com/${locale}`,
      languages: {
        'ar': 'https://ajar.com/ar',
        'en': 'https://ajar.com/en',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}


export default async function HomePageSSR({ params }: HomePageProps) {
  const { locale } = await params;

  // Validate locale
  if (!['ar', 'en'].includes(locale)) notFound();

  return <HomePage locale={locale} />;
}
