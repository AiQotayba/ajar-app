"use client"

import { LucideIcon, Sparkles, Star, Circle, Hexagon, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MenuItem {
    key: string
    href: string
    icon: LucideIcon
}

interface ProfileStatsProps {
    items: MenuItem[]
    locale: string
    getLabel: (key: string) => string
    className?: string
}

export function ProfileStats({
    items,
    locale,
    getLabel,
    className,
}: ProfileStatsProps) {
    const direction = locale === 'ar' ? 'rtl' : 'ltr'

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto", className)} dir={direction}>
            {items.map((item, index) => {
                const Icon = item.icon

                return (
                    <div
                        key={item.key}
                        className={cn(
                            "relative group",
                            "bg-card",
                            "rounded-3xl p-4 md:p-6",
                            "shadow-lg",
                            "border border-border/50",
                            "overflow-hidden",
                            "animate-in fade-in slide-in-from-bottom-4 duration-500",
                            "hover:shadow-xl transition-all duration-300",
                            "cursor-pointer"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Background Icon */}
                        <div className={cn(
                            "absolute bottom-0 opacity-5 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none",
                            direction === 'rtl' ? "left-0" : "right-0"
                        )}>
                            <Icon className={cn(
                                "h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 text-primary",
                                direction === 'rtl'
                                    ? "translate-x-[-25%] translate-y-1/4"
                                    : "translate-x-1/4 translate-y-1/4"
                            )} strokeWidth={1} />
                        </div>

                        {/* Scattered Icons */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <Sparkles className="absolute top-3 left-4 h-3 w-3 text-primary/10 animate-pulse" style={{ animationDelay: '0s' }} />
                            <Star className="absolute top-6 right-6 h-2 w-2 text-primary/8 animate-pulse" style={{ animationDelay: '0.5s' }} />
                            <Circle className="absolute top-10 left-12 h-2 w-2 text-primary/12 animate-pulse" style={{ animationDelay: '1s' }} />
                            <Hexagon className="absolute bottom-6 right-10 h-2 w-2 text-primary/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
                            <Sparkles className="absolute bottom-3 left-8 h-2 w-2 text-primary/8 animate-pulse" style={{ animationDelay: '2s' }} />
                        </div>

                        {/* Content */}
                        <Link
                            href={item.href}
                            className={cn(
                                "relative z-10 w-full flex items-center gap-4 justify-between"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex items-center justify-center rounded-xl p-2.5 md:p-3 transition-all duration-200",
                                    "group-hover:scale-105",
                                    "bg-primary/10 group-hover:bg-primary/20"
                                )}>
                                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary transition-colors" />
                                </div>
                                <span className="text-sm md:text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                                    {getLabel(item.key)}
                                </span>
                            </div>
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center transition-all group-hover:bg-primary/30">
                                <ChevronLeft className={cn(
                                    "h-5 w-5 text-primary",
                                    direction === 'rtl' ? "rotate-180" : "rotate-0"
                                )} />
                            </div>
                        </Link>
                    </div>
                )
            })}
        </div>
    )
}

