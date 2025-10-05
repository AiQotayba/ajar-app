"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { CoushIcon } from "../icons/coush"
import { HeartIcon } from "../icons/heart"
import { HeartFillIcon } from "../icons/heart-fill"
import { PinIcon } from "../icons/pin"
import { RoomIcon } from "../icons/room"
import { ShareIcon } from "../icons/share"
import { ShieldCheckIcon } from "../icons/shield-check"

interface ListingCardProps {
  listing: {
    id: number
    image: string
    title: string
    description: string
    price: string
    period?: string
    location: string
    bedrooms: number
    furnished: boolean
    deposit?: string
    badge?: string
    badgeType?: "rent" | "featured"
    isFavorite?: boolean
    safe_home?: string
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/property/${listing.id}`} className="block group">
      <div className="bg-card  overflow-hidden transition-all duration-300">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={listing.image || "/placeholder.svg?height=400&width=600&query=modern property"}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 !rounded-2xl"
            fill
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 !rounded-2xl via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge */}
          {listing.badge && (
            <Badge
              variant={listing.badgeType === "featured" ? "default" : "secondary"}
              className="absolute top-4 right-4 shadow-lg "
            >
              {listing.badge}
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white"
            >
              <ShareIcon className="!h-6 !w-6" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white transition-all",
                listing.isFavorite && "text-destructive",
              )}
            >
              {listing.isFavorite ?
                <HeartFillIcon className={cn("!h-6 !w-6 fill-red-500")} />
                : <HeartIcon className={cn("!h-6 !w-6 fill-red-500")} />
              }
            </Button>
          </div>
        </div>

        <div className="py-5 space-y-4">
          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </div>

          {/* Price */}

          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2   text-primary font-bold w-max">{listing.price}$ / شهر</div>
            {listing.period && (
              <Badge variant="default" className="text-md p-2 rounded-full px-4 text-[14px] text-gray-600 bg-primary/10">
                {listing.period}
              </Badge>
            )}
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 pt-3 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <PinIcon className="h-4 w-4 text-primary" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RoomIcon className="h-4 w-4" />
              <span>{listing.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CoushIcon className="h-4 w-4" />
              <span>{listing.furnished ? "مفروش" : "غير مفروش"}</span>
            </div>
            {listing.deposit && (
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">تأمين: {listing.deposit}</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </Link>
  )
}
