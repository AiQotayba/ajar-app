"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslations, useLocale } from "next-intl"
import { shareContent } from "@/components/shared/share-content"
import { CoushIcon } from "../icons/coush"
import { HeartIcon } from "../icons/heart"
import { HeartFillIcon } from "../icons/heart-fill"
import { PinIcon } from "../icons/pin"
import { ShareIcon } from "../icons/share"
import { ShieldCheckIcon } from "../icons/shield-check"
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useListingViewTracker } from "@/hooks/use-listing-view-tracker"

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
    category?: {
      name: {
        ar: string
        en: string
      }
    }
    area?: number
    bedrooms?: number
    bathrooms?: number
    latitude?: string | number
    longitude?: string | number
  }
  locale?: string
  onFavoriteRemoved?: (listingId: number) => void
  openEdit?: boolean
  deleteListing?: boolean
}

// مكون منفصل لأزرار الحذف والتعديل
interface ListingActionsProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  listingId: number
  locale: string
  onEdit?: (listingId: number) => void
  onDelete?: (listingId: number) => void
}

function ListingActions({ isOpen, setIsOpen, listingId, locale, onEdit, onDelete }: ListingActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const t = useTranslations('property')
  const currentLocale = useLocale()

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
    <DropdownMenu dir={(locale || currentLocale) === 'ar' ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild onClick={() => setIsOpen(!isOpen)}>
        <Button
          size="icon"
          variant="secondary"
          aria-label={(locale || currentLocale) === 'ar' ? 'المزيد من الإجراءات' : 'More actions'}
          className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white"
        >
          <MoreVertical aria-hidden="true" className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white">
        <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:text-primary">
          <Edit className="mx-2 h-4 w-4 text-primary" />
          <span className="text-primary">{t('editListing')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="mx-2 h-4 w-4 text-destructive" />
          {isDeleting ? t('deleting') : t('deleteListing')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ListingCard({ listing, locale, onFavoriteRemoved, openEdit, deleteListing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(listing.is_favorite || false)
  const [favoritesCount, setFavoritesCount] = useState(listing.favorites_count || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('property')
  const currentLocale = useLocale()
  const router = useRouter()
  // Track view when listing card enters viewport (only in lists, not in details)
  const viewTrackerRef = useListingViewTracker(listing.id, {
    enabled: !openEdit, // Only track in lists, not in edit/delete views
  })

  const getLocalizedText = (text: { ar: string; en: string }) => text[(locale || currentLocale) as keyof typeof text] || text.ar

  const displayTitle = getLocalizedText(listing.title)
  const displayLocation = listing.city
    ? `${getLocalizedText(listing.city.name)}, ${getLocalizedText(listing.governorate.name)}`
    : getLocalizedText(listing.governorate.name)

  const displayPrice = `${listing.price.toLocaleString()} ${listing.currency}`
  const periodText = listing.type === 'rent' ? (listing.pay_every ? t('everyMonth', { months: listing.pay_every }) : t('monthly')) : ''

  const mainImage = (listing.images?.[0]?.full_url) || "/images/placeholder.svg?height=400&width=600&query=modern property"
  const placeholderImage = "/images/placeholder.svg?height=400&width=600&query=modern property"
  const imageToShow = imageError ? placeholderImage : mainImage

  // Check if furnished from features
  const isFurnished = listing.features?.some(feature => {
    const featureName = getLocalizedText(feature.name).toLowerCase()
    return featureName.includes('مفروش') || featureName.includes('furnished')
  }) || false

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to listing details
    e.stopPropagation()

    setIsLoading(true)
    try {
      const data: any = await api.post(`/user/listings/${listing.id}/toggle-favorite`)

      if (!data.isError) {
        // Update favorite state based on API response
        const action = data?.data?.action
        console.log(action);

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
        if (data.key === "You are not logged in") {
          toast.error(locale === 'ar' ? 'يرجى تسجيل الدخول لإضافة المفضلة' : 'Please log in to add to favorites')
        }
        else toast.error(data.message || t('favoritesError'))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(t('favoritesError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to listing details
    e.stopPropagation()

    const listingUrl = window.location.origin + `/${locale || currentLocale}/listings/${listing.id}`
    const imageUrl = mainImage && mainImage !== placeholderImage ? mainImage : undefined

    await shareContent({
      data: {
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        type: listing.type,
        category: listing.category,
        governorate: listing.governorate,
        city: listing.city,
        area: listing.area,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        latitude: listing.latitude,
        longitude: listing.longitude,
        listingUrl,
        imageUrl,
        locale: locale || currentLocale,
      },
    })
  }

  const handleEdit = (listingId: number) => {
    // Navigate to edit page
    router.push(`/my-listings/${listingId}`)
  }

  const handleDelete = async (listingId: number) => {
    try {
      const response = await api.delete(`/user/listings/${listingId}`)

      if (!response.isError) {
        toast.success(t('deleteListing'))
        // Refresh the page or update the list
        window.location.reload()
      } else {
        toast.error(response.message || t('deleteListing'))
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      toast.error(t('deleteListing'))
    }
  }

  const isRTL = (locale || currentLocale) === 'ar'
  const url = openEdit ? `/my-listings/${listing.id}` : `/listings/${listing.id}`
  return (
    <Link
      href={url}
      className="block group"
      aria-label={isRTL ? `فتح الإعلان: ${displayTitle}` : `Open listing: ${displayTitle}`}
    >
      <div ref={viewTrackerRef} className="bg-card  overflow-hidden transition-all duration-300">
        <div className="relative h-56 overflow-hidden">
          {/* Image Layer */}
          <Image
            src={imageToShow}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 !rounded-2xl"
            fill
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />

          {/* Placeholder Overlay - Show when using placeholder image */}
          {imageError && (
            <div className="absolute inset-0   flex items-center justify-center z-10">
              <div className="text-center  "></div>
              <div className="w-20 h-20 flex-col mx-auto mb-2 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs mt-2 text-muted-foreground">
                  {t('imageLoadFailed')}
                </p>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 !rounded-2xl via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            {listing.is_featured && (
              <Badge
                variant="default"
                className="shadow-lg"
              >
                {t('featured')}
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
          <div className="absolute top-4 left-4 flex gap-2 z-30">
            <Button
              variant="secondary"
              aria-label={isRTL ? `عدد المشاهدات ${listing.views_count}` : `${listing.views_count} views`}
              className="h-10 flex text-white items-center justify-center rounded-full shadow-lg backdrop-blur-sm bg-black/30 hover:bg-black/30"
            >
              <Eye aria-hidden="true" className="!h-6 !w-6 text-white" />
              <span className="-mb-1">
                {listing.views_count}
              </span>
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleShare}
              aria-label={isRTL ? 'مشاركة الإعلان' : 'Share listing'}
              className="h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white"
            >
              <ShareIcon aria-hidden="true" className="!h-6 !w-6" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleToggleFavorite}
              disabled={isLoading}
              aria-label={
                isFavorite
                  ? (isRTL ? 'إزالة من المفضلة' : 'Remove from favorites')
                  : (isRTL ? 'إضافة إلى المفضلة' : 'Add to favorites')
              }
              className={cn(
                "h-10 w-10 rounded-full shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white transition-all",
                isFavorite && "text-destructive",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isFavorite
                ? <HeartFillIcon aria-hidden="true" className={cn("!h-6 !w-6 text-red-500")} />
                : <HeartIcon aria-hidden="true" className={cn("!h-6 !w-6 text-muted-foreground hover:text-red-500")} />
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
                {listing.type === 'rent' && ` / ${t('perMonth')}`}
              </div>
              {periodText && (
                <Badge variant="default" className="text-md p-2 rounded-full px-4 text-[14px] text-gray-600 bg-primary/10">
                  {periodText}
                </Badge>
              )}
            </div>
            {isOpen && (
              <div className="p-2 text-primary font-bold w-max">
                {t('openListing')}
              </div>
            )}
            {/* أزرار الحذف والتعديل */}
            {(openEdit || deleteListing) && (
              <ListingActions
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                listingId={listing.id}
                locale={locale || currentLocale}
                onEdit={openEdit ? handleEdit : undefined}
                onDelete={deleteListing ? handleDelete : undefined}
              />
            )}
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 pt-3 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <PinIcon aria-hidden="true" className="h-4 w-4 text-primary" />
              <span>{displayLocation}</span>
            </div>
            {listing.features && listing.features.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CoushIcon aria-hidden="true" className="h-4 w-4" />
                <span>{isFurnished ? t('furnished') : t('unfurnished')}</span>
              </div>
            )}
            {listing.insurance && (
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheckIcon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('insurance')}: {listing.insurance.toLocaleString()} {listing.currency}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
