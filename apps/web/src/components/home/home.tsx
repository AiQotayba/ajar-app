"use client";

import { CategoryFilter } from "@/components/filters/category-filter";
import { HeroSlider } from "@/components/home/hero-slider";
import { ListingGridMore } from "../listings/listing-grid-more";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";

interface HomePageProps {
  locale?: string;
}

export default function HomePage({ locale }: HomePageProps) {
  const nextLocale = useLocale();
  const currentLocale = locale || nextLocale || "ar";

  const { data, isLoading: homeLoading, error } = useQuery({
    queryKey: ["home"],
    queryFn: async ({ signal }) => {
      const url = `/user/home`;
      return api.get(url, { fetchOptions: { signal } });
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {currentLocale === "ar"
            ? "حدث خطأ في تحميل البيانات"
            : "Error loading data"}
        </p>
      </div>
    );
  }

  const homeData = data?.data;
  const sliders = homeData?.sliders;
  const isLoading = homeLoading;

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="space-y-6 mt-2">
        <HeroSlider sliders={sliders} isLoading={isLoading} />
        <CategoryFilter />
        <div className="px-4">
          <ListingGridMore />
        </div>
      </main>
    </div>
  );
}
