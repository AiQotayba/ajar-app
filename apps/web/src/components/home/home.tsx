"use client";

import LoadingSkeleton from "@/app/[locale]/(public)/loading";
import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { Header } from "@/components/layout/header";
import { ListingGrid } from "@/components/listings/listing-grid";
import { SearchBar } from "@/components/search/search-bar";
import { useTranslationsHook } from "@/hooks/use-translations";
import { useAdvancedFilters } from "@/hooks/use-advanced-filters";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export default function HomePage({ locale = 'ar' }: any) {
  const t = useTranslationsHook();
  const searchParams = useSearchParams();
  const { filters } = useAdvancedFilters();

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filters.propertyType && filters.propertyType !== 'بيع') {
      params.set('property_type', filters.propertyType);
    }
    if (filters.propertyCategory) {
      params.set('category', filters.propertyCategory);
    }
    if (filters.governorate) {
      params.set('governorate', filters.governorate);
    }
    if (filters.city) {
      params.set('city', filters.city);
    }
    if (filters.priceFrom) {
      params.set('price_from', filters.priceFrom);
    }
    if (filters.priceTo) {
      params.set('price_to', filters.priceTo);
    }
    if (filters.areaFrom) {
      params.set('area_from', filters.areaFrom);
    }
    if (filters.areaTo) {
      params.set('area_to', filters.areaTo);
    }
    if (filters.rooms) {
      params.set('rooms', filters.rooms);
    }
    if (filters.furnished && filters.furnished !== 'furnished') {
      params.set('furnished', filters.furnished);
    }

    Object.entries(filters.selectedProperties).forEach(([propertyId, value]) => {
      if (value) {
        params.set(`property_${propertyId}`, value);
      }
    });

    if (filters.selectedFeatures.length > 0) {
      params.set('features', filters.selectedFeatures.join(','));
    }

    return params.toString();
  };

  const queryParams = buildQueryParams();
  const hasFilters = queryParams.length > 0;


  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', locale, queryParams],
    queryFn: async () => {
      const baseUrl = '/user/home?sort_field=sort_order&sort_order=asc';
      const fullUrl = hasFilters ? `${baseUrl}&${queryParams}` : baseUrl;
      
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
