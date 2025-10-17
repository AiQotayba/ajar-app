"use client"

import * as React from "react"
import { Star, MessageSquare, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import type { TableColumn } from "@/components/table/table-core"
import type { Review } from "@/lib/types/review"

// Helper function to render star rating
export const renderStars = (rating: number) => {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                />
            ))}
        </div>
    )
}

// Columns definition for reviews table
export const getReviewsColumns = (
    updateMutation: { mutate: (data: { id: number; isApproved: boolean }) => void; isPending: boolean }
): TableColumn<Review>[] => [
        {
            key: "user",
            label: "المراجع",
            width: "min-w-[200px]",
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={value.avatar_url || undefined} alt={value.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                            {value.first_name?.charAt(0)}{value.last_name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-foreground">{value.full_name}</p>
                        <p className="text-xs text-muted-foreground">{value.phone}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "rating",
            label: "التقييم",
            sortable: true,
            width: "w-36",
            render: (value, row) => (
                <div className="space-y-1">
                    {renderStars(value)}
                    <p className="text-xs text-muted-foreground font-medium">
                        {value} من 5
                    </p>
                </div>
            ),
        },
        {
            key: "comment",
            label: "التعليق",
            width: "min-w-[250px]",
            render: (value, row) => (
                <div className="text-xs text-muted-foreground font-medium">{value}</div>
            ),
        },
        {
            key: "is_approved",
            label: "الحالة",
            sortable: true,
            width: "w-32",
            render: (value, row) => (
                <div className="space-y-2">
                    <Select
                        value={value ? "approved" : "pending"}
                        onValueChange={(newValue) => {
                            const isApproved = newValue === "approved"
                            updateMutation.mutate({ id: row.id, isApproved })
                        }}
                        disabled={updateMutation.isPending}
                        dir="rtl"
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-3 w-3" />
                                    قيد المراجعة
                                </div>
                            </SelectItem>
                            <SelectItem value="approved">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3" />
                                    موافق
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ),
        },
        {
            key: "created_at",
            label: "التاريخ",
            sortable: true,
            width: "w-40",
            render: (value) => (
                <div className="text-sm">
                    <p className="font-medium text-foreground">
                        {format(new Date(value), "dd MMM yyyy", { locale: ar })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(value), "hh:mm a", { locale: ar })}
                    </p>
                </div>
            ),
        },
    ]

