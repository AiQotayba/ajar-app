"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CategoryIconProps {
    icon: string | null | undefined
    alt?: string
    size?: "xs" | "sm" | "md" | "lg" | "xl"
    className?: string
}

const sizeClasses = {
    xs: "h-5 w-5 text-xs",
    sm: "h-6 w-6 text-sm",
    md: "h-8 w-8 text-base",
    lg: "h-12 w-12 text-2xl",
    xl: "h-16 w-16 text-3xl",
}

export function CategoryIcon({ icon, alt = "", size = "md", className }: CategoryIconProps) {
    if (!icon) return null

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://ajar-backend.mystore.social'
    const isImagePath = icon.includes('/') || icon.includes('.')

    return (
        <div 
            className={cn(
                "flex items-center justify-center rounded-lg bg-primary/10 overflow-hidden shrink-0",
                sizeClasses[size],
                className
            )}
        >
            {isImagePath ? (
                <img 
                    src={icon.startsWith('http') ? icon : `${baseUrl}/storage/${icon}`}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span>{icon}</span>
            )}
        </div>
    )
}


