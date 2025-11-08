"use client"

import { Sparkles, Star, Circle, Hexagon, Pencil, Phone, Mail, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface User {
    id: number
    first_name: string
    last_name: string
    full_name: string
    phone: string
    email?: string
    avatar?: string
    avatar_url?: string
    phone_verified: boolean
    wallet_balance?: number
    listings_count?: number
    notifications_unread_count?: number
}

interface ProfileHeaderProps {
    user: User | null
    getLabel: (key: string) => string
    className?: string
    locale: string
}

export function ProfileHeader({ user, getLabel, className, locale }: ProfileHeaderProps) {
    const direction = locale === 'ar' ? 'rtl' : 'ltr'

    // Helper function to get initials from name
    const getInitials = (name: string) => {
        if (!name) return locale === 'ar' ? 'م' : 'U'
        const words = name.trim().split(' ')
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase()
        }
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
    }

    // Helper function to format phone number with +
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return ''
        return phone.startsWith('+') ? phone : `+${phone}`
    }

    // Check if avatar is default
    const isDefaultAvatar = (avatarUrl: string) => {
        return avatarUrl && avatarUrl.includes('default_avatar.jpg')
    }

    return (
        <div
            className={cn(
                "relative group",
                "bg-card",
                "rounded-3xl p-4 md:p-6",
                "shadow-lg",
                "border border-border/50",
                "overflow-hidden",
                "animate-in fade-in slide-in-from-bottom-4 duration-500",
                "hover:shadow-xl transition-all duration-300",
                "max-w-4xl mx-auto",
                className
            )}
            dir={direction}
        >
            {/* Background User Name */}
            <div className={cn(
                "absolute bottom-0 opacity-10 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none",
                direction === 'rtl' ? "left-0" : "right-0"
            )}>
                <div className={cn(
                    "h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80 text-primary flex items-center justify-center",
                    direction === 'rtl'
                        ? "translate-x-[-25%] translate-y-1/4"
                        : "translate-x-1/4 translate-y-1/4"
                )}>
                    <div className="w-full h-full bg-primary/20 rounded-full flex items-center justify-center">
                        <span className={cn(
                            "text-6xl md:text-7xl lg:text-8xl font-bold text-primary/30",
                            direction === 'rtl' ? "font-arabic" : ""
                        )}>
                            {user?.full_name || ''}
                        </span>
                    </div>
                </div>
            </div>

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

            {/* Content */}
            <div className={cn(
                "relative z-10 flex flex-row items-center gap-6 md:gap-8"
            )}>
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary/20 transition-all duration-300 group-hover:border-primary/40 group-hover:scale-105">
                        {user?.avatar_url && !isDefaultAvatar(user.avatar_url) ? (
                            <Image
                                src={user.avatar_url}
                                alt={user?.full_name || 'User'}
                                width={160}
                                height={160}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-primary flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-bold text-primary-foreground">
                                    {getInitials(user?.full_name || '')}
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Edit Button */}
                    <Link
                        href={`/${locale}/profile/edit`}
                        className={cn(
                            "absolute w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-background transition-all hover:scale-110 hover:bg-primary/90",
                            direction === 'rtl' ? "bottom-0 left-0" : "bottom-0 right-0"
                        )}
                    >
                        <Pencil className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                    </Link>
                </div>

                {/* User Info & Actions */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* User Info */}
                    <div className={cn(
                        "flex-1 space-y-3",
                        direction === 'rtl' ? "text-right" : "text-left"
                    )}>
                        <h2 className={cn(
                            "text-xl md:text-2xl lg:text-3xl font-bold text-foreground",
                            "animate-in fade-in duration-500 delay-150",
                            direction === 'rtl' ? "slide-in-from-left-2" : "slide-in-from-right-2"
                        )}>
                            {user?.full_name || ''}
                        </h2>

                        {user?.phone && (
                            <div className={cn(
                                "flex items-center gap-2",
                                "animate-in fade-in duration-500 delay-200",
                                direction === 'rtl' ? "flex-row slide-in-from-left-2" : "slide-in-from-right-2"
                            )}>
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <p className="text-muted-foreground text-sm md:text-base lg:text-lg" dir="ltr">
                                    {formatPhoneNumber(user.phone)}
                                </p>
                            </div>
                        )}

                        {user?.email && (
                            <div className={cn(
                                "flex items-center gap-2",
                                "animate-in fade-in duration-500 delay-250",
                                direction === 'rtl' ? "flex-row slide-in-from-left-2" : "slide-in-from-right-2"
                            )}>
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <p className="text-muted-foreground text-xs md:text-sm lg:text-base" dir="ltr">
                                    {user.email}
                                </p>
                            </div>
                        )}

                        {user?.phone_verified && (
                            <div className={cn(
                                "flex items-center gap-2 mt-2",
                                "animate-in fade-in duration-500 delay-300",
                                direction === 'rtl' ? "flex-row slide-in-from-left-2" : "slide-in-from-right-2"
                            )}>
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-xs md:text-sm text-green-600 font-medium">
                                    {getLabel('validated')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Edit Button */}
                    <div className={cn(
                        "flex flex-col md:flex-row items-center gap-3 md:gap-4",
                        direction === 'rtl' ? "md:flex-row-reverse" : ""
                    )}>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Link href={`/${locale}/profile/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span>{getLabel('menuItems.editAccount')}</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

