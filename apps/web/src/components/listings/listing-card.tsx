"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { CoushIcon } from "../icons/coush"
import { HeartIcon } from "../icons/heart"
import { HeartFillIcon } from "../icons/heart-fill"
import { PinIcon } from "../icons/pin"
import { ShareIcon } from "../icons/share"
import { ShieldCheckIcon } from "../icons/shield-check"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ListingCardProps {
  listing: {
    id: number
    title: {
      ar: string
      en: string
    }
    description: {
      ar: string
      en: string
    }
    price: number
    currency: string
    type: "rent" | "sale"
    cover_image?: string
    images?: Array<{
      url: string
      full_url: string
      sort_order: number
    }>
    governorate: {
      name: {
        ar: string
        en: string
      }
    }
    city?: {
      name: {
        ar: string
        en: string
      }
    } | null
    features?: Array<{
      name: {
        ar: string
        en: string
      }
    }>
    is_featured: boolean
    views_count: number
    favorites_count: number
    pay_every?: number | null
    insurance?: number | null
    is_favorite?: boolean
    status?: "draft" | "in_review" | "approved" | "rejected"
    availability_status?: "available" | "rented" | "sold"
    status_badge?: {
      color: string
      text: string
    }
  }
  locale?: string
  onFavoriteRemoved?: (listingId: number) => void
  openEdit?: boolean
  deleteListing?: boolean
}

// مكون منفصل لأزرار الحذف والتعديل
interface ListingActionsProps {
  listingId: number
  onEdit?: (listingId: number) => void
  onDelete?: (listingId: number) => void
}

function ListingActions({ listingId, onEdit, onDelete }: ListingActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(listingId)
    } catch (error) {
      console.error('Error deleting listing:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => onEdit && onEdit(listingId)

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:text-primary">
          <Edit className="mx-2 h-4 w-4 text-primary" />
          <span className="text-primary">تعديل الإعلان</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="mx-2 h-4 w-4 text-destructive" />
          {isDeleting ? 'جاري الحذف...' : 'حذف الإعلان'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ListingCard({ listing, locale = 'ar', onFavoriteRemoved, openEdit, deleteListing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite || false)
  const [favoritesCount, setFavoritesCount] = useState(listing.favorites_count || 0)
  const [isLoading, setIsLoading] = useState(false)

  const getLocalizedText = (text: { ar: string; en: string }) => text[locale as keyof typeof text] || text.ar


  const displayTitle = getLocalizedText(listing.title)
  const displayLocation = listing.city
    ? `${getLocalizedText(listing.city.name)}, ${getLocalizedText(listing.governorate.name)}`
    : getLocalizedText(listing.governorate.name)

  const displayPrice = `${listing.price.toLocaleString()} ${listing.currency}`
  const periodText = listing.type === 'rent' ? (listing.pay_every ? `كل ${listing.pay_every} شهر` : 'شهرياً') : ''

  const mainImage = listing.cover_image || (listing.images?.[0]?.full_url) || "/images/placeholder.svg?height=400&width=600&query=modern property"

  // Check if furnished from features
  const isFurnished = listing.features?.some(feature =>
    getLocalizedText(feature.name).toLowerCase().includes('مفروش') ||
    getLocalizedText(feature.name).toLowerCase().includes('furnished')
  ) || false

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to listing details
    e.stopPropagation()

    setIsLoading(true)
    try {
      const data: any = await api.post(`/user/listings/${listing.id}/toggle-favorite`)

      if (!data.isError) {
        // Update favorite state based on API response
        const action = data?.data?.action

        if (action === 'added') {
          setIsFavorite(true)
          setFavoritesCount(prev => prev + 1)
        } else if (action === 'removed') {
          setIsFavorite(false)
          setFavoritesCount(prev => Math.max(0, prev - 1))

          // Notify parent component if callback is provided
          if (onFavoriteRemoved) {
            onFavoriteRemoved(listing.id)
          }
        }

        // Show success message
        toast.success(data.message)
      } else {
        // Handle API error
        toast.error(data.message || (locale === 'ar' ? 'حدث خطأ في تحديث المفضلة' : 'Error updating favorites'))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(locale === 'ar' ? 'حدث خطأ في تحديث المفضلة' : 'Error updating favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to listing details
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: getLocalizedText(listing.description),
          url: window.location.origin + `/${locale}/listings/${listing.id}`,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.origin + `/${locale}/listings/${listing.id}`)
      toast.success(locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied')
    }
  }

  const handleEdit = (listingId: number) => {
    // Navigate to edit page
    window.location.href = `/my-listings/${listingId}`
  }

  const handleDelete = async (listingId: number) => {
    try {
      const response = await api.delete(`/user/listings/${listingId}`)

      if (!response.isError) {
        toast.success('تم حذف الإعلان بنجاح')
        // Refresh the page or update the list
        window.location.reload()
      } else {
        toast.error(response.message || 'حدث خطأ في حذف الإعلان')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast.error('حدث خطأ في حذف الإعلان')
    }
  }

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="bg-card  overflow-hidden transition-all duration-300">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={mainImage}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 !rounded-2xl"
            fill
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 !rounded-2xl via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {listing.is_featured && (
              <Badge
                variant="default"
                className="shadow-lg"
              >
                مميز
              </Badge>
            )}
            {listing.status_badge && (
              <Badge
                variant="secondary"
                className={`shadow-lg ${listing.status_badge.color}`}
              >
                {listing.status_badge.text}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleShare}
              className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white"
            >
              <ShareIcon className="!h-6 !w-6" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleToggleFavorite}
              disabled={isLoading}
              className={cn(
                "h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white transition-all",
                isFavorite && "text-destructive",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isFavorite ?
                <HeartFillIcon className={cn("!h-6 !w-6 text-red-500")} />
                : <HeartIcon className={cn("!h-6 !w-6 text-muted-foreground hover:text-red-500")} />
              }
            </Button>
          </div>
        </div>

        <div className="py-5 space-y-4">
          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
              {displayTitle}
            </h3>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between gap-2 ">
            <div className="flex flex-wrap  items-center gap-2">
              <div className="p-2 text-primary font-bold w-max">
                {displayPrice}
                {listing.type === 'rent' && ' / شهر'}
              </div>
              {periodText && (
                <Badge variant="default" className="text-md p-2 rounded-full px-4 text-[14px] text-gray-600 bg-primary/10">
                  {periodText}
                </Badge>
              )}
            </div>
            {/* أزرار الحذف والتعديل */}
            {(openEdit || deleteListing) && (
              <ListingActions
                listingId={listing.id}
                onEdit={openEdit ? handleEdit : undefined}
                onDelete={deleteListing ? handleDelete : undefined}
              />
            )}
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 pt-3 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <PinIcon className="h-4 w-4 text-primary" />
              <span>{displayLocation}</span>
            </div>
            {listing.features && listing.features.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CoushIcon className="h-4 w-4" />
                <span>{isFurnished ? "مفروش" : "غير مفروش"}</span>
              </div>
            )}
            {listing.insurance && (
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">تأمين: {listing.insurance.toLocaleString()} {listing.currency}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
