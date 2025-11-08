"use client"

import * as React from "react"
import {
    Building2, MapPin, User, Eye, TrendingUp, Star, Info, Sparkles, Box, MessageSquare,
    Reply, Check, X, Trash2, Send, MoreVertical
} from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import type { Listing } from "@/lib/types/listing"
import Images from "@/components/ui/image"

interface ListingViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    listing: Listing | null
}

export function ListingView({ open, onOpenChange, urlEndpoint, listing }: ListingViewProps) {
    if (!listing) return null

    const queryClient = useQueryClient()
    const [replyDialogOpen, setReplyDialogOpen] = React.useState(false)
    const [selectedReview, setSelectedReview] = React.useState<any>(null)
    const [replyMessage, setReplyMessage] = React.useState("")

    // Fetch reviews for this listing
    const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
        queryKey: ["listing-reviews", listing.id],
        queryFn: () => api.get("/admin/reviews", { params: { "listing.id": listing.id } }),
        enabled: open && !!listing.id,
    })

    const reviews = reviewsData?.data || []

    // Reply mutation
    const replyMutation = useMutation({
        mutationFn: ({ id, message }: { id: number; message: string }) =>
            api.post(`/admin/reviews/${id}/replay`, { message }),
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ["listing-reviews", listing.id] })
            toast.success(response?.message || "تم إضافة الرد بنجاح")
            setReplyDialogOpen(false)
            setReplyMessage("")
            setSelectedReview(null)
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "فشل إضافة الرد")
        },
    })

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
            api.post(`/admin/reviews/${id}/status`, { status }),
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ["listing-reviews", listing.id] })
            toast.success(response?.message || "تم تحديث حالة التقييم")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "فشل تحديث الحالة")
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/users/reviews/${id}`),
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ["listing-reviews", listing.id] })
            toast.success(response?.message || "تم حذف التقييم")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "فشل حذف التقييم")
        },
    })

    const handleReply = (review: any) => {
        setSelectedReview(review)
        setReplyDialogOpen(true)
    }

    const handleSubmitReply = () => {
        if (!replyMessage.trim()) {
            toast.error("الرجاء كتابة رد")
            return
        }
        replyMutation.mutate({ id: selectedReview.id, message: replyMessage })
    }

    const handleApprove = (id: number) => {
        updateStatusMutation.mutate({ id, status: "approved" })
    }

    const handleReject = (id: number) => {
        updateStatusMutation.mutate({ id, status: "rejected" })
    }

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
            deleteMutation.mutate(id)
        }
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                {/* Images */}
                {(listing.media && listing.media.length > 0) && (
                    <div className="relative">
                        <Carousel dir="ltr">
                            <CarouselContent>
                                {(listing.media || []).map((item, index) => (
                                    <CarouselItem key={item.id || index}>
                                        <div className="aspect-video bg-muted">
                                            <Images
                                                src={item.full_url || item.url}
                                                alt={listing.title?.ar || "صورة الإعلان"}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                        </Carousel>
                        {/* Badges overlay */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className={statusColors[listing.status]}>
                                {statusLabels[listing.status]}
                            </Badge>
                            {listing.is_featured && (
                                <Badge className="bg-amber-500">⭐ مميز</Badge>
                            )}
                            <Badge variant="secondary">
                                {listing.type === "sale" ? "💰 بيع" : "🏠 إيجار"}
                            </Badge>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Title & Price */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-1">{listing.title?.ar || "بدون عنوان"}</h2>
                            {listing.description?.ar && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {listing.description.ar}
                                </p>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-2xl font-bold text-primary">
                                {listing.price.toLocaleString("en")}
                            </p>
                            <p className="text-xs text-muted-foreground">{listing.currency}</p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {listing.governorate && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{listing.governorate.name.ar}</span>
                            </div>
                        )}

                        {listing.category && (
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{listing.category.name.ar}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{listing.views_count}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>{listing.favorites_count}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="info" dir="rtl">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="info" className="gap-1">
                                <Info className="h-3 w-3" />
                                معلومات
                            </TabsTrigger>
                            <TabsTrigger value="features" className="gap-1">
                                <Sparkles className="h-3 w-3" />
                                المميزات
                                {listing.features && listing.features.length > 0 && (
                                    <Badge variant="secondary" className="h-4 px-1 text-xs ml-1">
                                        {listing.features.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="properties" className="gap-1">
                                <Box className="h-3 w-3" />
                                الخصائص
                                {listing.properties && listing.properties.length > 0 && (
                                    <Badge variant="secondary" className="h-4 px-1 text-xs ml-1">
                                        {listing.properties.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="gap-1">
                                <MessageSquare className="h-3 w-3" />
                                التقييمات
                                {listing.reviews_count > 0 && (
                                    <Badge variant="secondary" className="h-4 px-1 text-xs ml-1">
                                        {listing.reviews_count}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Info Tab */}
                        <TabsContent value="info" className="space-y-3 mt-4">
                            {listing.owner && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={(listing.owner as any).avatar_url} />
                                        <AvatarFallback className="text-sm">
                                            {listing.owner.first_name?.[0]}{listing.owner.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {(listing.owner as any).full_name || `${listing.owner.first_name} ${listing.owner.last_name}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                                            {listing.owner.phone}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {listing.average_rating > 0 && (
                                <div className="flex items-center gap-2 p-3 rounded-lg border">
                                    <Star className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <p className="text-lg font-bold">{listing.average_rating.toFixed(1)}</p>
                                        <p className="text-xs text-muted-foreground">{listing.reviews_count} تقييم</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Features Tab */}
                        <TabsContent value="features" className="mt-4">
                            {listing.features && listing.features.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {listing.features.map((feature: any, index) => (
                                        <Badge key={feature.id || index} variant="outline" className="px-3 py-1">
                                            {feature.name?.ar || feature}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    لا توجد مميزات
                                </p>
                            )}
                        </TabsContent>

                        {/* Properties Tab */}
                        <TabsContent value="properties" className="mt-4">
                            {listing.properties && listing.properties.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {listing.properties.map((prop: any, index) => (
                                        <div key={prop.id || index} className="p-3 rounded-lg border">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {prop.property?.name?.ar || "خاصية"}
                                            </p>
                                            <p className="text-sm font-semibold">{prop.value}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    لا توجد خصائص
                                </p>
                            )}
                        </TabsContent>

                        {/* Reviews Tab */}
                        <TabsContent value="reviews" className="mt-4">
                            {reviewsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3 p-3 border rounded-lg">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : reviews && reviews.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {reviews.map((review: any) => (
                                        <div key={review.id} className="p-3 border rounded-lg space-y-3">
                                            <div className="flex gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={review.user?.avatar_url} />
                                                    <AvatarFallback className="text-sm">
                                                        {review.user?.first_name?.[0]}{review.user?.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm font-medium">
                                                            {review.user?.full_name || `${review.user?.first_name} ${review.user?.last_name}`}
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                            <span className="text-sm font-bold">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {review.comment}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(new Date(review.created_at), "dd MMM yyyy", { locale: ar })}
                                                        </span>
                                                        {review.is_approved ? (
                                                            <Badge className="h-5 bg-green-500 text-xs">معتمد</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="h-5 text-xs">قيد المراجعة</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 justify-between">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleReply(review)}
                                                    className="h-7 text-xs"
                                                >
                                                    <Reply className="h-3 w-3 ml-1" />
                                                    رد
                                                </Button>

                                                {!review.is_approved && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleApprove(review.id)}
                                                        disabled={updateStatusMutation.isPending}
                                                        className="h-7 text-xs text-green-600 hover:text-green-700"
                                                    >
                                                        <Check className="h-3 w-3 ml-1" />
                                                        اعتماد
                                                    </Button>
                                                )}

                                                <DropdownMenu dir="rtl">
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {review.is_approved && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleReject(review.id)}
                                                                disabled={updateStatusMutation.isPending}
                                                                className="text-orange-600"
                                                            >
                                                                <X className="h-4 w-4 ml-2" />
                                                                إلغاء الاعتماد
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(review.id)}
                                                            disabled={deleteMutation.isPending}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 ml-2" />
                                                            حذف التقييم
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    لا توجد تقييمات لهذا الإعلان
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <span className="font-mono">#{listing.id}</span>
                        <span>{format(new Date(listing.created_at), "dd MMM yyyy", { locale: ar })}</span>
                    </div>
                </div>

                {/* Reply Dialog */}
                <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Reply className="h-5 w-5" />
                                الرد على التقييم
                            </DialogTitle>
                        </DialogHeader>

                        {selectedReview && (
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-muted/30 border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={selectedReview.user?.avatar_url} />
                                            <AvatarFallback className="text-xs">
                                                {selectedReview.user?.first_name?.[0]}{selectedReview.user?.last_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                            <span className="text-sm font-bold">{selectedReview.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedReview.comment}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ردك:</label>
                                    <Textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="اكتب ردك هنا..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setReplyDialogOpen(false)
                                    setReplyMessage("")
                                    setSelectedReview(null)
                                }}
                                disabled={replyMutation.isPending}
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleSubmitReply}
                                disabled={replyMutation.isPending || !replyMessage.trim()}
                            >
                                <Send className="h-4 w-4 ml-2" />
                                {replyMutation.isPending ? "جاري الإرسال..." : "إرسال"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    )
}

