import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { ListingGridMore } from "@/components/listings/listing-grid-more";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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

// ISR: regenerate the page every 60 seconds
export const revalidate = 60;

export default async function HomePageSSR({ params }: HomePageProps) {
  const { locale } = await params;

  // Validate locale
  if (!["ar", "en"].includes(locale)) notFound();

  // Fetch home data on the server using fetch (SSR + ISR)
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://backend.ajarsyria.com/api/v1";

  const res = await fetch(`${baseUrl}/user/home`, {
    next: { revalidate },
  });

  const result = await res.json();
  const homeData = (result?.data ?? result) as any | undefined;

  const hasError = !res.ok || !homeData;
  const errorMessage = hasError
    ? locale === "ar"
      ? "حدث خطأ في تحميل البيانات"
      : "Error loading data"
    : null;

  const sliders = homeData?.sliders;

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="space-y-6 mt-2">
        <HeroSlider sliders={sliders} isLoading={false} />
        <CategoryFilter />
        <div className="px-4">
          <ListingGridMore />
        </div>
      </main>
    </div>
  );
}