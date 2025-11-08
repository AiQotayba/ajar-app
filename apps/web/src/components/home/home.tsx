"use client";

import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { ListingGrid } from "@/components/listings/listing-grid";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { ListingGridMore } from "../listings/listing-grid-more";

export default function HomePage({ locale = 'ar' }: any) {
  const searchParams = useSearchParams();

  const queryParams = searchParams.toString();
  const hasFilters = queryParams.length > 0;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', locale],
    queryFn: async () => {
      const baseUrl = '/user/home';
      const fullUrl = `${baseUrl}?${queryParams}`;

      const response = await api.get(fullUrl, {
        headers: {
          'Accept-Language': locale,
        }
      });

      return response;
    },
    staleTime: hasFilters ? 2 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  // add api call to get listings

  const { data: listingsData, isLoading: isListingsLoading, error: isListingsError } = useQuery({
    queryKey: ['listings', locale, queryParams],
    queryFn: async () => {
      const response = await api.get(`/user/listings?${queryParams}`);
      return response;
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {locale === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="space-y-6 mt-2">

        {/* Hero Slider */}
        <HeroSlider sliders={products?.data?.sliders} isLoading={isLoading} />

        {/* Category Filter */}
        <CategoryFilter data={products?.data?.categories} isLoading={isLoading} />

        {/* Listings */}
        <div className="px-4">
          <ListingGridMore />
        </div>
      </main>
    </div>
  );
}
