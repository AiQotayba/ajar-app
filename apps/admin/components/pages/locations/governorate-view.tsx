"use client"

import * as React from "react"
import { MapPin, Building2, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Governorate } from "@/lib/types/location"

interface GovernorateViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    governorate: Governorate | null
}

export function GovernorateView({ open, onOpenChange, urlEndpoint, governorate }: GovernorateViewProps) {
    if (!governorate) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {governorate.name.ar}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">{governorate.name.en}</p>
                    </div>
                    <Badge variant={governorate.is_active !== false ? "default" : "secondary"}>
                        {governorate.is_active !== false ? (
                            <>
                                <Eye className="h-3 w-3 ml-1" />
                                نشطة
                            </>
                        ) : (
                            <>
                                <EyeOff className="h-3 w-3 ml-1" />
                                معطلة
                            </>
                        )}
                    </Badge>
                </div>

                {/* Content */}
                <div className="space-y-4 py-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        {governorate.cities_count !== undefined && (
                            <div className="text-center p-3 rounded-lg border">
                                <Building2 className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                                <p className="text-2xl font-bold">{governorate.cities_count}</p>
                                <p className="text-xs text-muted-foreground">مدينة</p>
                            </div>
                        )}

                        {governorate.listings_count !== undefined && (
                            <div className="text-center p-3 rounded-lg border">
                                <Building2 className="h-5 w-5 mx-auto mb-2 text-green-500" />
                                <p className="text-2xl font-bold">{governorate.listings_count}</p>
                                <p className="text-xs text-muted-foreground">إعلان</p>
                            </div>
                        )}
                    </div>

                    {/* Code */}
                    {governorate.code && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">الكود:</span>
                            <code className="mr-2 px-2 py-1 bg-muted rounded">{governorate.code}</code>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                    <span>#{governorate.id}</span>
                    <span>{format(new Date(governorate.created_at), "dd MMM yyyy", { locale: ar })}</span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
