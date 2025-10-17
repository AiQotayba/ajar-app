"use client"

import { ListingGrid } from "@/components/listings/listing-grid"
import { api } from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Header } from "../layout/header"
import { SearchBar } from "../search/search-bar"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

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
    const queryClient = useQueryClient()
    const router = useRouter()
    const { user } = useAuth()
    console.log(user);


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
            const response = await api.get('/user/listings?owner_id=1')

            if (response.isError) {
                throw new Error(response.message || 'Failed to fetch your listings')
            }

            return response.data || []
        },
        enabled: !!user?.id,
        retry: 2,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })

    // Delete listing mutation
    const deleteListingMutation = useMutation({
        mutationFn: async (listingId: number) => {
            const response = await api.delete(`/user/listings/${listingId}`)

            if (response.isError) {
                throw new Error(response.message || 'Failed to delete listing')
            }

            return response.data
        },
        onSuccess: () => {
            // Invalidate and refetch listings
            queryClient.invalidateQueries({ queryKey: ['my-listings'] })
            toast.success('تم حذف الإعلان بنجاح')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'حدث خطأ في حذف الإعلان')
        }
    })

    const listings = listingsData || []

    // Helper function to get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'in_review':
                return 'bg-yellow-100 text-yellow-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'draft':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Helper function to get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved':
                return 'معتمد'
            case 'in_review':
                return 'قيد المراجعة'
            case 'rejected':
                return 'مرفوض'
            case 'draft':
                return 'مسودة'
            default:
                return status
        }
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pb-24">
                <Header title="إعلاناتي" showNotification showBack />
                <div className="p-4 pt-4">
                    <SearchBar />
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    // Show error state
    if (isError) {
        return (
            <div className="min-h-screen bg-background pb-24">
                <Header title="إعلاناتي" showNotification showBack />
                <div className="p-4 pt-4">
                    <SearchBar />
                </div>
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground mb-4">
                        {error?.message || 'حدث خطأ في تحميل إعلاناتك'}
                    </p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        )
    }

    // Show empty state
    if (listings.length === 0) {
        return (
            <div className="min-h-screen bg-background pb-24">
                <Header title="إعلاناتي" showNotification showBack />

                <div className="p-4 pt-4">
                    <SearchBar />
                </div>

                {/* Add new listing button */}
                <div className="p-4">
                    <Link href="/listings/create">
                        <Button className="w-full" size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            إضافة إعلان جديد
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
                    <h2 className="text-2xl font-bold text-center mb-4">لا يوجد إعلانات!</h2>
                    <p className="text-muted-foreground text-center mb-6">
                        ابدأ بإضافة إعلانك الأول لبيع أو إيجار عقارك
                    </p>
                    <Link href="/listings/create">
                        <Button size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            إضافة إعلان جديد
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <Header title="إعلاناتي" showNotification showBack />

            <div className="p-4 pt-4">
                <SearchBar />
            </div>

            {/* Add new listing button */}
            <div className="p-4">
                <Link href="/listings/create">
                    <Button className="w-full" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        إضافة إعلان جديد
                    </Button>
                </Link>
            </div>

            {/* Results count */}
            <div className="px-4 pb-2">
                <p className="text-sm text-muted-foreground">
                    {listings.length} {listings.length === 1 ? 'إعلان' : 'إعلان'} من إعلاناتك
                </p>
            </div>

            <main className="space-y-6 px-4">
                <ListingGrid
                    data={listings.map((listing: Listing) => ({
                        ...listing, 
                    }))}
                    openEdit={true}
                    deleteListing={true}
                />
            </main>
        </div>
    )
}
