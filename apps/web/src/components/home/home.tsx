"use client";

import LoadingSkeleton from "@/app/[locale]/loading";
import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { Header } from "@/components/layout/header";
import { ListingGrid } from "@/components/listings/listing-grid";
import { SearchBar } from "@/components/search/search-bar";
import { useTranslationsHook } from "@/hooks/use-translations";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function HomePage({ locale = 'ar' }: any) {
  const t = useTranslationsHook();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', locale],
    queryFn: () => api.get('/user/home', {
      headers: {
        'Accept-Language': locale,
      }
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading)
    return <LoadingSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header title={locale === 'ar' ? 'الرئيسية' : 'Home'} showNotification />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title={locale === 'ar' ? 'الرئيسية' : 'Home'} showNotification />

      <main className="space-y-6">
        {/* Search Section */}
        <div className="px-4 pt-4">
          <SearchBar />
        </div>

        {/* Hero Slider */}
        <HeroSlider sliders={products?.data?.sliders} />

        {/* Category Filter */}
        <CategoryFilter data={products?.data?.categories} />

        {/* Listings */}
        <div className="px-4">
          <ListingGrid data={products?.data?.listings} />
        </div>
      </main>
    </div>
  );
}
