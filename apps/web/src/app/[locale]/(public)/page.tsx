import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { ListingGridMore as ListingsGrid } from "@/components/listings/listing-grid-more";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
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

async function ListingsSection({
  baseUrl,
  listingQueryString,
}: {
  baseUrl: string
  listingQueryString: string
}) {
  const initialListingsResponse = await fetch(`${baseUrl}/user/listings?${listingQueryString}`, {
    next: { revalidate },
  }).then(async (res) => {
    if (!res.ok) {
      return null;
    }
    return res.json();
  });

  return <ListingsGrid initialResponse={initialListingsResponse} />;
}

function ListingsLoadingSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="w-full mx-auto overflow-hidden rounded-2xl">
          <Skeleton className="h-56 w-full rounded-t-2xl" />
          <div className="space-y-3 px-4 py-5">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-6 w-2/5" />
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePageSSR({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params;
  const query = await searchParams;
  if (!["ar", "en"].includes(locale)) notFound();

  // Fetch home data on the server using fetch (SSR + ISR)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend.ajarsyria.com/api/v1";
  const listingParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((v) => listingParams.append(key, v));
      return;
    }
    listingParams.set(key, value);
  });

  listingParams.delete("page");
  if (!listingParams.has("status")) {
    listingParams.set("status", "approved");
  }
  listingParams.set("page", "1");
  listingParams.set("per_page", "24");

  const { sliders } = await fetch(`${baseUrl}/user/home`, { next: { revalidate } })
    .then(async res => await res.json())
    .then(data => data.data)

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="space-y-6 mt-2">
        <HeroSlider sliders={sliders} isLoading={false} />
        <CategoryFilter />
        <div className="px-4">
          <Suspense fallback={<ListingsLoadingSkeleton />}>
            <ListingsSection
              baseUrl={baseUrl}
              listingQueryString={listingParams.toString()}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}