"use client";

import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { ListingGridMore } from "../listings/listing-grid-more";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

interface HomePageProps {
  locale?: string;
}

const STALE_TIME_WITH_FILTERS = 2 * 60 * 1000; // 2 minutes
const STALE_TIME_WITHOUT_FILTERS = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

export default function HomePage({ locale }: HomePageProps) {
  const nextLocale = useLocale();
  const currentLocale = locale || nextLocale || 'ar';
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString();
  const hasFilters = queryParams.length > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ['home', currentLocale, queryParams],
    queryFn: async () => {
      const url = `/user/home${queryParams ? `?${queryParams}` : ''}`;
      return api.get(url)
    },
    staleTime: hasFilters ? STALE_TIME_WITH_FILTERS : STALE_TIME_WITHOUT_FILTERS,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {currentLocale === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
        </p>
      </div>
    );
  }

  const homeData = data?.data;

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="space-y-6 mt-2">
        <HeroSlider sliders={homeData?.sliders} isLoading={isLoading} />
        <CategoryFilter data={homeData?.categories} isLoading={isLoading} />
        <div className="px-4">
          <ListingGridMore />
        </div>
      </main>
    </div>
  );
}
