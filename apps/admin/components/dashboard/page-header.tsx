"use client"

import { LucideIcon, Plus, Upload, CheckCircle, Sparkles, Star, Circle, Hexagon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    description?: string
    icon?: LucideIcon
    actions?: Array<{
        label: string
        onClick: () => void
        icon?: LucideIcon
        variant?: "default" | "outline" | "secondary"
        disabled?: boolean
    }>
    className?: string
}

export function PageHeader({
    title,
    description,
    icon,
    actions,
    className,
}: PageHeaderProps) {
    const Icon: any = icon

    return (
        <div className={cn(
            "relative group",
            "bg-card",
            "rounded-3xl p-4 md:p-6",
            "shadow-lg",
            "border border-border/50",
            "overflow-hidden",
            "animate-in fade-in slide-in-from-bottom-4 duration-500",
            "hover:shadow-xl transition-all duration-300",
            className
        )}>
            {/* Background Icon */}
            {Icon && (
                <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none">
                    <Icon className="h-56 w-56 md:h-72 md:w-72 lg:h-80 lg:w-80 text-primary translate-x-1/4 translate-y-1/4" strokeWidth={1} />
                </div>
            )}

            {/* Scattered Icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Sparkles className="absolute top-6 left-8 h-5 w-5 text-primary/10 animate-pulse" style={{ animationDelay: '0s' }} />
                <Star className="absolute top-14 right-12 h-4 w-4 text-primary/8 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Circle className="absolute top-20 left-24 h-3 w-3 text-primary/12 animate-pulse" style={{ animationDelay: '1s' }} />
                <Hexagon className="absolute bottom-12 right-20 h-4 w-4 text-primary/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
                <Sparkles className="absolute bottom-6 left-16 h-3 w-3 text-primary/8 animate-pulse" style={{ animationDelay: '2s' }} />
                <Star className="absolute top-28 right-32 h-4 w-4 text-primary/10 animate-pulse" style={{ animationDelay: '2.5s' }} />
                <Circle className="absolute bottom-20 left-40 h-4 w-4 text-primary/8 animate-pulse" style={{ animationDelay: '3s' }} />
                <Hexagon className="absolute top-36 right-12 h-3 w-3 text-primary/12 animate-pulse" style={{ animationDelay: '3.5s' }} />
                <Sparkles className="absolute bottom-32 right-28 h-4 w-4 text-primary/10 animate-pulse" style={{ animationDelay: '4s' }} />
                <Star className="absolute top-12 left-36 h-3 w-3 text-primary/8 animate-pulse" style={{ animationDelay: '4.5s' }} />
            </div>

            <div className="relative z-10 flex flex-row justify-between gap-4 md:gap-6">
                {/* Title and Description Section */}
                <div className="space-y-3 md:space-y-4">

                    {/* Title Section */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Icon */}
                        {Icon && (
                            <div className="flex items-center justify-center rounded-xl bg-primary/10 p-2.5 md:p-3 transition-all duration-200 group-hover:bg-primary/20 group-hover:scale-105">
                                <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className={cn(
                                "text-xl md:text-2xl font-semibold text-foreground",
                                "animate-in fade-in slide-in-from-right-4 delay-150"
                            )}>
                                {title}
                            </h1>
                        </div>
                    </div>

                    {description && (
                        <p className={cn(
                            "text-sm md:text-base text-muted-foreground",
                            "max-w-2xl leading-relaxed",
                            "animate-in fade-in slide-in-from-right-4 delay-200"
                        )}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {actions && actions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-bottom-2 delay-300">
                        {actions.map((action, index) => {
                            const ActionIcon = action.icon || (index === 0 ? Plus : Upload)
                            const isPrimary = index === 0

                            return (
                                <Button
                                    key={index}
                                    variant={action.variant || (isPrimary ? "default" : "outline")}
                                    size="default"
                                    className={cn(
                                        "gap-2 transition-all duration-200",
                                        "hover:scale-105 active:scale-95",
                                        "font-medium",
                                        isPrimary && "shadow-sm hover:shadow-md"
                                    )}
                                    onClick={action.onClick}
                                    disabled={action.disabled}
                                >
                                    <ActionIcon className="h-4 w-4" />
                                    <span>{action.label}</span>
                                </Button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
