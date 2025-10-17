"use client"

import * as React from "react"
import { Star, MessageSquare, CheckCircle, XCircle, User, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Review } from "@/lib/types/review"
import { renderStars } from "./columns"

interface ReviewViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    review: Review | null
}

export function ReviewView({ open, onOpenChange, urlEndpoint, review }: ReviewViewProps) {
    if (!review) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>تفاصيل التقييم</span>
                        <Badge
                            variant={review.is_approved ? "default" : "secondary"}
                            className={review.is_approved ? "bg-green-500" : "bg-amber-500"}
                        >
                            {review.is_approved ? (
                                <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    موافق عليه
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    قيد المراجعة
                                </>
                            )}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        عرض كامل لتفاصيل التقييم
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Rating */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">التقييم</h3>
                        <div className="flex items-center gap-3">
                            {renderStars(review.rating)}
                            <span className="text-2xl font-bold text-foreground">{review.rating}</span>
                            <span className="text-sm text-muted-foreground">من 5</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Comment */}
                    {review.comment && (
                        <>
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">التعليق</h3>
                                <div className="p-4 rounded-lg bg-muted/50 border">
                                    <p className="text-sm leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Reviewer */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            المراجع
                        </h3>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={review.user.avatar_url || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                                    {review.user.first_name?.charAt(0)}{review.user.last_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold">{review.user.full_name}</p>
                                <p className="text-xs text-muted-foreground">{review.user.phone}</p>
                                <p className="text-xs text-muted-foreground">{review.user.email}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Listing */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            الإعلان
                        </h3>
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                            <div className="relative h-20 w-28 rounded-lg overflow-hidden bg-muted shrink-0">
                                {review.listing.cover_image ? (
                                    <img
                                        src={review.listing.cover_image}
                                        alt={review.listing.title.ar}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <p className="font-semibold text-foreground">{review.listing.title.ar}</p>
                                <p className="text-xs text-muted-foreground">{review.listing.title.en}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                    <span className="font-medium">السعر:</span>
                                    <span className="font-bold text-foreground">
                                        {review.listing.price} {review.listing.currency}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">الحالة:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {review.listing.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        <span>{review.listing.average_rating.toFixed(1)}</span>
                                        <span>({review.listing.reviews_count})</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">المشاهدات:</span> {review.listing.views_count}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                تاريخ التقييم
                            </h3>
                            <p className="text-sm font-medium">
                                {format(new Date(review.created_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">معرف التقييم</h3>
                            <p className="text-sm font-mono font-medium">#{review.id}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

