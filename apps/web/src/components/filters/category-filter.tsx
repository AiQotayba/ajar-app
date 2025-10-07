"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"
import { useState } from "react"

interface Category {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string | null;
    en: string | null;
  };
  parent_id: number | null;
  icon: string | null;
  properties_source: string;
  sort_order: number;
  is_visible: boolean;
  listings_count: number;
  children: Category[];
  properties: any[];
  features: any[];
  created_at: string;
  updated_at: string;
}

export function CategoryFilter({ data }: { data: Category[] | undefined }) {
  const [activeCategory, setActiveCategory] = useState<Category | undefined>(undefined)
  const locale = useLocale()

  // إذا لم تكن هناك بيانات، لا نعرض المكون
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div dir="rtl" className="w-full">
      <Tabs value={activeCategory?.id.toString()} onValueChange={(value: string) => setActiveCategory(data?.find((category) => category.id.toString() === value))} className="w-full !rounded-none" dir="rtl">
        <TabsList
          className={cn(
            "flex w-full h-auto gap-2 p-1",
            "overflow-x-auto overflow-y-hidden",
            "scrollbar-hide !rounded-none",
            "snap-x snap-mandatory",
            "scroll-smooth justify-start",
          )}
        >
          {data.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id.toString()}
              className="
                flex-shrink-0 snap-start !w-max px-6 py-2.5
                bg-primary/20
                data-[state=active]:bg-primary
                data-[state=active]:text-primary-foreground
                data-[state=active]:shadow-md
                whitespace-nowrap transition-all !flex-0 cursor-pointer
              "
            >
              {category.name[locale as keyof typeof category.name]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <CategoryFilter data={activeCategory?.children} />
    </div>
  )
}
