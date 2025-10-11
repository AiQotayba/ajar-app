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
    title: locale === 'ar' ? 'أجار - منصة العقارات في سوريا' : 'Ajar - Syrian Real Estate Platform',
    description: locale === 'ar'
      ? 'منصة شاملة للعقارات في سوريا. ابحث عن شقق، فيلل، مكاتب، محلات وأراضي للبيع والإيجار'
      : 'Comprehensive real estate platform in Jordan. Find apartments, villas, offices, shops and land for sale and rent',
    keywords: locale === 'ar'
      ? 'عقارات سوريا، شقق للبيع، فيلل للإيجار، مكاتب تجارية، محلات، أراضي'
      : 'Jordan real estate, apartments for sale, villas for rent, commercial offices, shops, land',
    openGraph: {
      title: locale === 'ar' ? 'أجار - منصة العقارات في سوريا' : 'Ajar - Syrian Real Estate Platform',
      description: locale === 'ar'
        ? 'منصة شاملة للعقارات في سوريا'
        : 'Comprehensive real estate platform in Jordan',
      type: 'website',
      locale: locale === 'ar' ? 'ar_SY' : 'en_SY',
      siteName: 'Ajar',
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'ar' ? 'أجار - منصة العقارات في سوريا' : 'Ajar - Syrian Real Estate Platform',
      description: locale === 'ar'
        ? 'منصة شاملة للعقارات في سوريا'
        : 'Comprehensive real estate platform in Jordan',
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
  if (!['ar', 'en'].includes(locale)) {
    notFound();
  }

  return <HomePage locale={locale} />;
}
