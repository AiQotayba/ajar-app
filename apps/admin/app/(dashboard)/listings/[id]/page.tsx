"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Building2, MapPin, User, Eye, TrendingUp, Star, Sparkles, Box, MessageSquare, Calendar, Phone } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/dashboard/page-header"
import { api } from "@/lib/api"
import type { Listing } from "@/lib/types/listing"
import Images from "@/components/ui/image"

export default function ListingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const listingId = params?.id ? Number(params.id) : null

    const { data: listingData, isLoading, error } = useQuery({
        queryKey: ["listing", listingId],
        queryFn: () => api.get(`/admin/listings/${listingId}`),
        enabled: !!listingId,
    })

    const listing = listingData?.data as Listing | undefined

    const [playingMediaIndex, setPlayingMediaIndex] = React.useState<number | null>(null)

    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ["listing-reviews", listingId],
        queryFn: () => api.get("/admin/reviews", { params: { "listing.id": listingId ?? 0 } }),
        enabled: !!listingId && !!listing,
    })

    const reviews = reviewsData?.data || []

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="تفاصيل الإعلان" description="جاري التحميل..." icon={Building2} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (error || !listing) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="تفاصيل الإعلان"
                    description="حدث خطأ أثناء تحميل البيانات"
                    icon={Building2}
                    actions={[{
                        label: "العودة للقائمة",
                        icon: ArrowRight,
                        onClick: () => router.push("/listings"),
                    }]}
                />
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">لم يتم العثور على الإعلان</p>
                        <Button onClick={() => router.push("/listings")}>
                            <ArrowRight className="h-4 w-4 ml-2" />
                            العودة للقائمة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statusColors = {
        draft: "bg-gray-500",
        in_review: "bg-blue-500",
        approved: "bg-green-500",
        rejected: "bg-red-500",
    }

    const statusLabels = {
        draft: "مسودة",
        in_review: "قيد المراجعة",
        approved: "معتمد",
        rejected: "مرفوض",
    }

    const formattedPrice = `${listing.price.toLocaleString("en")} ${listing.currency}`
    const priceText = listing.type === "rent"
        ? `${formattedPrice}${listing.pay_every ? ` كل ${listing.pay_every} شهر` : " / شهر"}`
        : formattedPrice

    const location = listing.city
        ? `${typeof listing.city.name === 'object' ? listing.city.name?.ar : listing.city.name}, ${typeof listing.governorate?.name === 'object' ? listing.governorate?.name?.ar : listing.governorate?.name}`
        : (typeof listing.governorate?.name === 'object' ? listing.governorate?.name?.ar : listing.governorate?.name) || ""

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title="تفاصيل الإعلان"
                description={`#${listing.id}`}
                icon={Building2}
                actions={[{
                    label: "العودة للقائمة",
                    icon: ArrowRight,
                    onClick: () => router.push("/listings"),
                }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gallery */}
                <Card className="overflow-hidden p-0">
                    {listing.media && listing.media.length > 0 ? (
                        <div className="relative">
                            <Carousel dir="ltr" className="w-full">
                                <CarouselContent>
                                        {listing.media.map((item: any, idx: number) => (
                                            <CarouselItem key={item.id}>
                                                <div className="aspect-video bg-muted relative">
                                                    {item.type === 'video' ? (
                                                        <div className="w-full h-full relative">
                                                            <div className="w-full h-full object-cover" 
                                                            dangerouslySetInnerHTML={{__html: item.iframely?.html || ''   }} />
                                                            {/* <Images
                                                                src={(item.iframely && item.iframely.thumbnail?.href) || item.full_url || item.url}
                                                                alt={listing.title?.ar || "فيديو"}
                                                                className="w-full h-full object-cover"
                                                            /> */}
                                                            <button
                                                                aria-label={`Play video ${idx + 1}`}
                                                                onClick={() => setPlayingMediaIndex(idx)}
                                                                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-black/40 flex items-center justify-center"
                                                            >
                                                                <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <Images
                                                            src={item.full_url || item.url}
                                                            alt={listing.title?.ar || "صورة الإعلان"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </Carousel>
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2 z-20">
                                <Badge className={statusColors[listing.status]}>
                                    {statusLabels[listing.status]}
                                </Badge>
                                {listing.is_featured && (
                                    <Badge className="bg-amber-500">مميز</Badge>
                                )}
                            </div>
                            {/* Image Counter */}
                            {listing.media.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                                    <Badge variant="secondary" className="bg-black/50 text-white">
                                        {listing.media.length} صورة
                                    </Badge>
                                </div>
                            )}
                            
                            {/* Video player modal */}
                            {playingMediaIndex !== null && listing.media && listing.media[playingMediaIndex] && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPlayingMediaIndex(null)}>
                                    <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                                        <button aria-label="Close" onClick={() => setPlayingMediaIndex(null)} className="absolute top-2 left-2 z-50 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center">×</button>
                                        {(() => {
                                            const item = listing.media[playingMediaIndex] as any
                                            if (!item) return null
                                            // Prefer iframely embed html when available
                                            if (item.iframely && item.iframely.html) {
                                                // Render embed inside a sandboxed iframe so scripts in the embed HTML execute safely
                                                return (
                                                    <iframe
                                                        title={`embed-${item.id}`}
                                                        src={(item.iframely as any).url}
                                                        sandbox="allow-scripts allow-same-origin allow-presentation"
                                                        className="w-full h-[60vh] bg-black"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                )
                                            }

                                            // YouTube shortcut
                                            const url = (item.iframely && item.iframely.url) || item.full_url || item.url
                                            if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                                                const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('youtu.be/')[1]?.split('?')[0]
                                                const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
                                                return <iframe src={src} className="w-full h-[60vh]" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="video-player" />
                                            }

                                            // Fallback to native video element
                                            return (
                                                <video controls className="w-full h-[60vh] bg-black">
                                                    <source src={item.full_url || item.url} />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">لا توجد صور</p>
                        </div>
                    )}
                </Card>

                {/* Main Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl mb-2">{listing.title?.ar || "بدون عنوان"}</CardTitle>
                        {listing.description?.ar && (
                            <p className="text-sm text-muted-foreground">{listing.description.ar}</p>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-2xl font-bold text-primary">{priceText}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {listing.category && (
                                <Badge variant="outline">
                                    {typeof listing.category.name === 'object' ? listing.category.name?.ar : listing.category.name}
                                </Badge>
                            )}
                            {location && (
                                <Badge variant="secondary">
                                    <MapPin className="h-3 w-3 ml-1" />
                                    {location}
                                </Badge>
                            )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <Eye className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                                <p className="text-sm font-semibold">{listing.views_count}</p>
                                <p className="text-xs text-muted-foreground">مشاهدة</p>
                            </div>
                            <div>
                                <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                                <p className="text-sm font-semibold">{listing.favorites_count}</p>
                                <p className="text-xs text-muted-foreground">مفضلة</p>
                            </div>
                            {listing.average_rating > 0 && (
                                <div>
                                    <Star className="h-4 w-4 fill-amber-500 text-amber-500 mx-auto mb-1" />
                                    <p className="text-sm font-semibold">{listing.average_rating.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">{listing.reviews_count} تقييم</p>
                                </div>
                            )}
                        </div>

                        {listing.owner && (
                            <>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={(listing.owner as any).avatar_url} />
                                        <AvatarFallback>
                                            {listing.owner.first_name?.[0]}{listing.owner.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {(listing.owner as any).full_name || `${listing.owner.first_name} ${listing.owner.last_name}`}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                                                {listing.owner.phone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">تاريخ الإنشاء</p>
                                <p className="font-medium">
                                    {format(new Date(listing.created_at), "dd MMM yyyy", { locale: ar })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">آخر تحديث</p>
                                <p className="font-medium">
                                    {format(new Date(listing.updated_at), "dd MMM yyyy", { locale: ar })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            المميزات
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {listing.features.map((feature: any, index) => {
                                const featureName = typeof feature === 'string' 
                                    ? feature 
                                    : (typeof feature?.name === 'object' ? feature?.name?.ar : feature?.name || feature)
                                return (
                                    <Badge key={feature.id || index} variant="outline">
                                        {featureName}
                                    </Badge>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Properties */}
            {listing.properties && listing.properties.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Box className="h-5 w-5" />
                            الخصائص
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {listing.properties.map((prop: any, index) => {
                                const propertyName = prop.property?.name 
                                    ? (typeof prop.property.name === 'object' ? prop.property.name?.ar : prop.property.name)
                                    : "خاصية"
                                const propertyValue = typeof prop.value === 'object' 
                                    ? (prop.value?.ar || prop.value?.en || JSON.stringify(prop.value))
                                    : prop.value
                                return (
                                    <div key={prop.id || index} className="p-3 border rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            {propertyName}
                                        </p>
                                        <p className="text-sm font-semibold">{propertyValue}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        التقييمات ({listing.reviews_count})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {reviewsLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : reviews && reviews.length > 0 ? (
                        <div className="space-y-3">
                            {reviews.map((review: any) => (
                                <div key={review.id} className="flex gap-3 p-3 border rounded-lg">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={review.user?.avatar_url} />
                                        <AvatarFallback className="text-xs">
                                            {review.user?.first_name?.[0]}{review.user?.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium">
                                                {review.user?.full_name || `${review.user?.first_name} ${review.user?.last_name}`}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                                <span className="text-sm font-bold">{review.rating}</span>
                                                {review.is_approved ? (
                                                    <Badge className="h-5 bg-green-500 text-xs">معتمد</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="h-5 text-xs">قيد المراجعة</Badge>
                                                )}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(review.created_at), "dd MMM yyyy", { locale: ar })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">لا توجد تقييمات</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
