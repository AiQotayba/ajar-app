"use client";

import LoadingSkeleton from "@/app/[locale]/(public)/loading";
import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { MainLayout } from "@/components/layout/main-layout";
import { ListingGrid } from "@/components/listings/listing-grid";
import { useTranslationsHook } from "@/hooks/use-translations";
import { useAdvancedFilters } from "@/hooks/use-advanced-filters";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function HomePage({ locale = 'ar' }: any) {
  const t = useTranslationsHook();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters } = useAdvancedFilters();
  const [sortField, setSortField] = useState('sort_order');
  const [sortOrder, setSortOrder] = useState('asc');

 

  const queryParams =  searchParams.toString();
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
    queryKey: ['listings', locale, queryParams, sortField, sortOrder],
    queryFn: async () => {
      const response = await api.get(`/user/listings?${queryParams}`);
      return response;
    },
  });

  if (isLoading) return <LoadingSkeleton />

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
        <HeroSlider sliders={products?.data?.sliders} />

        {/* Category Filter */}
        <CategoryFilter data={products?.data?.categories} />

        {/* Listings */}
        <div className="px-4">
          <ListingGrid
            data={listingsData?.data || listingsData}
            isLoading={isListingsLoading}
            pagination={listingsData?.meta as any}
          />
        </div>
      </main>
    </div>
  );
}
