"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useLocale, useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

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

export function CategoryFilter({ data, isLoading }: { data: Category[] | undefined, isLoading: boolean }) {
  const [activeCategory, setActiveCategory] = useState<Category | undefined>(undefined)
  const locale = useLocale()
  const t = useTranslations('filters')
  const router = useRouter()
  const searchParams = useSearchParams()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  // Initialize active category from searchParams
  useEffect(() => {
    const categoryId = searchParams.get('category_id')
    if (categoryId && data) {
      const category = data.find(cat => cat.id.toString() === categoryId)
      if (category) {
        setActiveCategory(category)
      }
    } else {
      // No category selected, show "All"
      setActiveCategory(undefined)
    }
  }, [searchParams, data])

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    const category = data?.find((cat) => cat.id.toString() === categoryId)
    setActiveCategory(category)
    
    // Update searchParams
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category_id', categoryId)
      // Reset to first page when category changes
      params.set('page', '1')
    } else {
      params.delete('category_id')
    }
    
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Show loading skeleton if loading
  if (isLoading) {
    return <CategoryFilterSkeleton direction={direction} />
  }

  // إذا لم تكن هناك بيانات، لا نعرض المكون
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div dir={direction} className="w-full">
      <Tabs 
        value={activeCategory?.id.toString() || ""} 
        onValueChange={handleCategoryChange} 
        className="w-full !rounded-none" 
        dir={direction}
      >
        <TabsList
          className={cn(
            "flex w-full h-auto gap-2 p-1",
            "overflow-x-auto overflow-y-hidden",
            "scrollbar-hide !rounded-none",
            "snap-x snap-mandatory",
            "scroll-smooth",
            "justify-start",
            // direction === 'rtl' ? "justify-start" : "justify-end",
          )}
        >
          {/* All Categories Button */}
          <TabsTrigger
            value=""
            className="
              flex-shrink-0 snap-start !w-max px-6 py-2.5
              bg-primary/20
              data-[state=active]:bg-primary
              data-[state=active]:text-primary-foreground
              data-[state=active]:shadow-md
              whitespace-nowrap transition-all !flex-0 cursor-pointer
            "
          >
            {t('all')}
          </TabsTrigger>
          
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
      <CategoryFilter data={activeCategory?.children} isLoading={false} />
    </div>
  )
}

function CategoryFilterSkeleton({ direction }: { direction: 'rtl' | 'ltr' }) {
  return (
    <div dir={direction} className="w-full">
      <div className={cn(
        "flex w-full h-auto gap-2 p-1 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory scroll-smooth animate-pulse",
        direction === 'rtl' ? "justify-start" : "justify-end"
      )}>
        {/* Generate skeleton tabs */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 snap-start w-max px-6 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg whitespace-nowrap relative overflow-hidden"
          >
            <div className="absolute inset-0 animate-shimmer opacity-50" />
            <div className="relative h-6 w-16 bg-transparent" />
          </div>
        ))}
      </div>
    </div>
  )
}
