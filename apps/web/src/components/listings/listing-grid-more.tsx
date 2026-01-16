"use client"

import { ListingCard } from "./listing-card"
import { Button } from "@/components/ui/button"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Search, Filter, RefreshCw, Home } from "lucide-react"

export function ListingGridMore() {
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('property')
  const tCommon = useTranslations('common')
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  // Build base query params (without page parameter)
  const baseParams = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page') // Remove page from base params, we'll handle it in the query
    // Ensure permanent default filter: status=approved
    if (!params.has('status')) {
      params.set('status', 'approved')
    }
    return params.toString()
  }, [searchParams])

  // Use infinite query to load pages incrementally
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isListingsLoading,
    error: isListingsError,
  } = useInfiniteQuery({
    queryKey: ['listings-infinite', locale, baseParams],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams(baseParams)
      params.set('page', pageParam.toString())

      const response = await api.get(`/user/listings?${params.toString()}&per_page=24`)
      return response
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta
      if (!meta) return undefined

      // Return next page number if there are more pages
      if (meta.current_page < meta.last_page) {
        return meta.current_page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Flatten all pages into a single array of listings
  const allListings = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page?.data || [])
  }, [data?.pages])

  // Get pagination meta from the last page
  const paginationMeta = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return null
    return data.pages[data.pages.length - 1]?.meta
  }, [data?.pages])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!allListings.length || !paginationMeta) return null

    const displayedCount = allListings.length
    const totalCount = paginationMeta.total || 0
    const pagesLoaded = data?.pages?.length || 0
    const totalPages = paginationMeta.last_page || 0

    // Count by type
    const saleCount = allListings.filter((l: any) => l.type === 'sale').length
    const rentCount = allListings.filter((l: any) => l.type === 'rent').length

    return {
      displayed: displayedCount,
      total: totalCount,
      pagesLoaded,
      totalPages,
      saleCount,
      rentCount,
      percentage: totalCount > 0 ? Math.round((displayedCount / totalCount) * 100) : 0,
    }
  }, [allListings, paginationMeta, data?.pages])

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const showLoadMore = hasNextPage && !isListingsLoading

  if (isListingsLoading) return <LoadingSkeleton />


  return (
    <div className="space-y-6">
      {/* Listings Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
        {allListings.length > 0 ? (
          allListings.map((listing: any) => (
            <div key={listing.id} className="w-full mx-auto">
              <ListingCard
                listing={listing}
                locale={locale}
              />
            </div>
          ))
        ) : (
          !isListingsLoading && (
            <EmptyState
              locale={locale}
              direction={direction}
              t={t}
              tCommon={tCommon}
              router={router}
              onClearFilters={() => {
                router.push(`/${locale}`)
              }}
            />
          )
        )}
      </div>

      {/* Loading More Skeleton - Show when fetching next page */}
      {isFetchingNextPage && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {showLoadMore && (
        <div className="flex flex-col items-center gap-3 pt-4 pb-2">
          <Button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className={cn(
              "min-w-[200px] h-12 px-8",
              "bg-white hover:bg-primary/10",
              "border-2 border-primary/20 hover:border-primary/40",
              "shadow-sm hover:shadow-md",
              "transition-all duration-300",
              "group relative overflow-hidden",
              isFetchingNextPage && "opacity-70 cursor-not-allowed"
            )}
          >
            <span className="relative z-10 flex items-center gap-2 font-medium text-primary">
              {isFetchingNextPage ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  <span>{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                </>
              ) : (
                <>
                  <span>{locale === 'ar' ? 'عرض المزيد' : 'Load More'}</span>
                  <ArrowDownIcon className="size-4 transition-transform group-hover:translate-y-1" />
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>

          {/* Simple Statistics */}
          {stats && allListings.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {locale === 'ar'
                  ? `عرض ${stats.displayed} من ${stats.total}`
                  : `Showing ${stats.displayed} of ${stats.total}`
                }
              </span>
              {/* {stats.saleCount > 0 && (
                <span className="text-green-600 dark:text-green-400">
                  {locale === 'ar' ? `${stats.saleCount} للبيع` : `${stats.saleCount} Sale`}
                </span>
              )}
              {stats.rentCount > 0 && (
                <span className="text-blue-600 dark:text-blue-400">
                  {locale === 'ar' ? `${stats.rentCount} للإيجار` : `${stats.rentCount} Rent`}
                </span>
              )} */}
            </div>
          )}
        </div>
      )}

      {/* End of Results Message */}
      {paginationMeta && !hasNextPage && allListings.length > 0 && (
        <div className="flex flex-col items-center gap-3 pt-4 pb-8">
          <p className="text-sm text-muted-foreground">
            {locale === 'ar'
              ? `تم عرض جميع النتائج (${paginationMeta.total})`
              : `All results displayed (${paginationMeta.total})`
            }
          </p>

        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
      {Array.from({ length: 12 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

// Icons
function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function EmptyState({
  locale,
  direction,
  t,
  tCommon,
  onClearFilters,
  router,
}: {
  locale: string
  direction: 'rtl' | 'ltr'
  t: (key: string) => string
  tCommon: (key: string) => string
  onClearFilters: () => void
  router: ReturnType<typeof useRouter>
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4" dir={direction}>
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon Container */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          {/* Background Circle */}
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />

          {/* Main Icon */}
          <div className="relative z-10 w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center">
            <Search className={cn(
              "w-12 h-12 text-primary/40",
              "animate-in fade-in zoom-in duration-500"
            )} strokeWidth={1.5} />
          </div>

          {/* Decorative Icons */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
            <Filter className="w-4 h-4 text-primary/30" strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-primary/5 rounded-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Home className="w-3 h-3 text-primary/30" strokeWidth={1.5} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <h3 className="text-2xl font-bold text-foreground">
            {t('noResults.title')}
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            {t('noResults.description')}
          </p>
        </div>

        {/* Actions */}
        <div className={cn(
          "flex flex-col sm:flex-row items-center justify-center gap-3 pt-4",
          direction === 'rtl' ? "sm:flex-row-reverse" : ""
        )}>
          <Button
            onClick={onClearFilters}
            variant="default"
            size="lg"
            className={cn(
              "min-w-[180px] gap-2",
              "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('noResults.clearFilters')}</span>
          </Button>

        </div>

        {/* Suggestions */}
        <div className={cn(
          "pt-6 space-y-2 text-sm text-muted-foreground",
          "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700"
        )}>
          <p className="font-medium">{t('noResults.suggestions.title')}</p>
          <ul className={cn(
            "space-y-1.5 text-left",
            direction === 'rtl' ? "text-right" : "text-left"
          )}>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{t('noResults.suggestions.checkSpelling')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{t('noResults.suggestions.tryDifferentKeywords')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{t('noResults.suggestions.reduceFilters')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="w-full mx-auto overflow-hidden transition-all duration-300 animate-pulse rounded-2xl">
      {/* Image Skeleton */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-2xl" />
        <div className="absolute inset-0 animate-shimmer opacity-50" />
        {/* Badges Skeleton */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="h-6 w-16 bg-white/90 rounded-full" />
        </div>
        {/* Action Buttons Skeleton */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <div className="h-10 w-10 rounded-full bg-white/90" />
          <div className="h-10 w-10 rounded-full bg-white/90" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="py-5 space-y-4 px-4">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
          <div className="h-5 bg-gray-100 rounded-lg w-1/2" />
        </div>

        {/* Price Skeleton */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 bg-gray-100 rounded-lg w-24" />
            <div className="h-7 bg-gray-100 rounded-full w-16" />
          </div>
        </div>

        {/* Property Details Skeleton */}
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 bg-gray-100 rounded-full" />
            <div className="h-4 bg-gray-100 rounded-lg w-20" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 bg-gray-100 rounded-full" />
            <div className="h-4 bg-gray-100 rounded-lg w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
