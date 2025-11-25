"use client"

import { ListingGrid } from "@/components/listings/listing-grid"
import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useTranslations, useLocale } from "next-intl"

interface Listing {
    id: number
    title: {
        ar: string
        en: string
    }
    description: {
        ar: string
        en: string
    }
    price: number
    currency: string
    type: "rent" | "sale"
    cover_image?: string
    images?: Array<{
        url: string
        full_url: string
        sort_order: number
    }>
    governorate: {
        name: {
            ar: string
            en: string
        }
    }
    city?: {
        name: {
            ar: string
            en: string
        }
    } | null
    features?: Array<{
        name: {
            ar: string
            en: string
        }
    }>
    is_featured: boolean
    views_count: number
    favorites_count: number
    pay_every?: number | null
    insurance?: number | null
    is_favorite?: boolean
    status: "draft" | "in_review" | "approved" | "rejected"
    availability_status: "available" | "rented" | "sold"
}

export function MyListingsContent() {
    const { user } = useAuth()
    const t = useTranslations('profile')
    const locale = useLocale()
    const direction = locale === 'ar' ? 'rtl' : 'ltr'

    // Fetch user's listings using React Query
    const {
        data: listingsData,
        isLoading,
        error,
        refetch,
        isError
    } = useQuery({
        queryKey: ['my-listings'],
        queryFn: async () => {
            const response = await api.get(`/user/listings?owner_id=${user?.id}`)

            if (response.isError) {
                throw new Error(response.message || t('errorLoading'))
            }

            return response.data || []
        },
        enabled: !!user?.id,
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })

    // Show error state
    if (isError) {
        return (
            <div className="min-h-screen bg-background pb-24">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground mb-4">
                        {error?.message || t('errorLoading')}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        {t('retry')}
                    </button>
                </div>
            </div>
        )
    }

    // Show empty state
    if (!isLoading && listingsData?.length === 0) {
        return (
            <div className="min-h-screen bg-background pb-24" dir={direction}>
                {/* Add new listing button */}
                <div className="p-4">
                    <Link href="/listings/create" className="max-w-[300px] ">
                        <Button className="w-full" size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            {t('addListing')}
                        </Button>
                    </Link>
                </div>

                {/* Empty state */}
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
                    <div className="relative w-80 h-80 mb-8">
                        <div className="absolute inset-0 bg-muted/30 rounded-[4rem]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Plus className="h-16 w-16 text-primary" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-20 left-12 text-muted-foreground/30 text-2xl">▲</div>
                        <div className="absolute top-32 right-16 text-muted-foreground/30 text-xl">▶</div>
                        <div className="absolute bottom-24 left-20 text-muted-foreground/30 text-lg">◀</div>
                        <div className="absolute bottom-32 right-12 text-muted-foreground/30">▼</div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-4">{t('noListingsTitle')}</h2>
                    <p className="text-muted-foreground text-center mb-6">
                        {t('noListingsDescription')}
                    </p>
                    <Link href="/listings/create">
                        <Button size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            {t('addListing')}
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-24" dir={direction}>
            {/* Header */}
            {/* Add new listing button */}
            <div className="p-4 flex justify-between">
                <h1 className="text-2xl font-bold">{t('menuItems.myListings')}</h1>
                <Link href="/listings/create" className="max-w-[300px] ">
                    <Button className="w-full" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        {t('addListing')}
                    </Button>
                </Link>
            </div>

            {/* Results count */}
            <div className="px-4 pb-2">
                <p className="text-sm text-muted-foreground">
                    {t('listingsCount', { count: listingsData?.length })}
                </p>
            </div>

            <main className="space-y-6 px-4">
                <ListingGrid
                    data={listingsData?.map((listing: Listing) => ({ ...listing }))}
                    isLoading={isLoading}
                    openEdit={true}
                    deleteListing={true}
                />
            </main>
        </div>
    )
}
