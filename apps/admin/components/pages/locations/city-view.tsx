"use client"

import * as React from "react"
import { Building2, MapPin, Eye, EyeOff } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { City } from "@/lib/types/location"

interface CityViewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    urlEndpoint: string
    city: City | null
}

export function CityView({ open, onOpenChange, urlEndpoint, city }: CityViewProps) {
    if (!city) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            {city.name.ar}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">{city.name.en}</p>
                    </div>
                    <Badge variant={city.is_active !== false ? "default" : "secondary"}>
                        {city.is_active !== false ? (
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
                    {/* Governorate */}
                    {city.governorate && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                            <MapPin className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium">{city.governorate.name.ar}</p>
                                <p className="text-xs text-muted-foreground">{city.governorate.name.en}</p>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    {city.listings_count !== undefined && (
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span className="text-sm">عدد الإعلانات</span>
                            </div>
                            <p className="text-xl font-bold text-primary">{city.listings_count}</p>
                        </div>
                    )}

                    {/* Code */}
                    {city.code && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">الكود:</span>
                            <code className="mr-2 px-2 py-1 bg-muted rounded">{city.code}</code>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                    <span>#{city.id}</span>
                    <span>{format(new Date(city.created_at), "dd MMM yyyy", { locale: ar })}</span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
