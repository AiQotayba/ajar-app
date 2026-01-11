"use client"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, TvIcon, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ShareIcon } from "../icons/share"
import { shareContent } from "@/components/shared/share-content"
import { HeartIcon } from "../icons/heart"
import { HeartFillIcon } from "../icons/heart-fill"
import CachedImage from "../CachedImage"
import { FullscreenImageViewer } from "./fullscreen-image-viewer"

interface GalleryImage {
  id: number
  url: string
  full_url: string
  sort_order: number
}

interface ListingsGalleryProps {
  images?: GalleryImage[]
  coverImage?: string
  badge?: string
  locale?: string
  isFavorite?: boolean
  listingId?: number
  ribon_text?: string
  ribon_color?: string
  favoritesCount?: number
  onFavoriteToggle?: (isFavorite: boolean, favoritesCount: number) => void
  listingData?: {
    title?: { ar: string; en: string }
    price?: number
    currency?: string
    type?: 'rent' | 'sale'
    category?: { name: { ar: string; en: string } }
    governorate?: { name: { ar: string; en: string } }
    city?: { name: { ar: string; en: string } } | null
    area?: number
    bedrooms?: number
    bathrooms?: number
    latitude?: string | number
    longitude?: string | number
  }
}

export function ListingsGallery({
  images = [],
  coverImage,
  badge,
  locale = 'ar',
  isFavorite: initialFavorite = false,
  listingId,
  ribon_text,
  ribon_color,
  favoritesCount: initialFavoritesCount = 0,
  onFavoriteToggle,
  listingData
}: ListingsGalleryProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount)
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [thumbnailCarouselApi, setThumbnailCarouselApi] = useState<CarouselApi>()
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [showAllImagesDialog, setShowAllImagesDialog] = useState(false)

  // Prepare images array - use cover image as first if available, then add other images
  const allImages = images
  console.log(allImages);
  

  // Sort images by sort_order
  const sortedImages = allImages.sort((a, b) => a.sort_order - b.sort_order)

  useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap())
    }

    carouselApi.on("select", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi])

  // Sync thumbnail carousel with current index
  useEffect(() => {
    if (thumbnailCarouselApi && currentIndex < 4) {
      thumbnailCarouselApi.scrollTo(currentIndex)
    }
  }, [currentIndex, thumbnailCarouselApi])

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || sortedImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % sortedImages.length
        if (carouselApi) {
          carouselApi.scrollTo(nextIndex)
        }
        return nextIndex
      })
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, sortedImages.length, carouselApi])

  const scrollToIndex = (index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index)
    }
  }

  const calculateMousePosition = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()

    // Get precise mouse coordinates relative to the thumbnail
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Calculate percentage position with high precision (0-100)
    const xPercent = Math.max(0, Math.min(100, (mouseX / rect.width) * 100))
    const yPercent = Math.max(0, Math.min(100, (mouseY / rect.height) * 100))

    // Round to 2 decimal places for precision
    return {
      x: Math.round(xPercent * 100) / 100,
      y: Math.round(yPercent * 100) / 100
    }
  }

  const handleOpenAllImagesDialog = () => {
    setShowAllImagesDialog(true)
  }

  const handleSelectImageFromDialog = (index: number) => {
    scrollToIndex(index)
    setShowAllImagesDialog(false)
    // Open fullscreen viewer after selecting from dialog
    setShowFullscreen(true)
  }

  const handleShare = async () => {
    const listingUrl = window.location.href
    const mainImage = coverImage || (sortedImages[0]?.full_url || sortedImages[0]?.url)
    const imageUrl = mainImage || undefined

    if (!listingData) {
      // Fallback to simple share if no listing data
      await shareContent({
        data: {
          title: 'Property Listing',
          listingUrl,
          imageUrl,
          locale,
        },
      })
      return
    }

    await shareContent({
      data: {
        title: listingData.title || { ar: 'Property Listing', en: 'Property Listing' },
        price: listingData.price,
        currency: listingData.currency,
        type: listingData.type,
        category: listingData.category,
        governorate: listingData.governorate,
        city: listingData.city,
        area: listingData.area,
        bedrooms: listingData.bedrooms,
        bathrooms: listingData.bathrooms,
        latitude: listingData.latitude,
        longitude: listingData.longitude,
        listingUrl,
        imageUrl,
        locale,
      },
    })
  }

  const handleZoom = () => {
    setShowFullscreen(true)
  }

  const handleToggleFavorite = async () => {
    if (!listingId) {
      toast.error(locale === 'ar' ? 'معرف العقار غير متوفر' : 'Listing ID not available')
      return
    }

    setIsLoading(true)
    try {
      const data: any = await api.post(`/user/listings/${listingId}/toggle-favorite`)

      if (!data.isError) {
        // Update favorite state based on API response
        const action = data?.data?.action

        if (action === 'added') {
          setIsFavorite(true)
          setFavoritesCount(prev => prev + 1)
        } else if (action === 'removed') {
          setIsFavorite(false)
          setFavoritesCount(prev => Math.max(0, prev - 1))
        }

        // Notify parent component if callback is provided
        if (onFavoriteToggle) {
          onFavoriteToggle(isFavorite, favoritesCount)
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

  // Don't render if no images
  if (sortedImages.length === 0) {
    return (
      <div className="relative h-80 rounded-3xl overflow-hidden flex items-center justify-center">
        <div className="text-center"></div>
        <div className="w-20 h-20 flex-col mx-auto mb-2 rounded-lg bg-gray-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs mt-2 text-muted-foreground">
            {locale === 'ar' ? 'فشل التحميل' : 'Failed to load'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image Carousel */}
        <div className="relative rounded-3xl overflow-hidden bg-muted/50">
          <Carousel
            opts={{
              align: "start",
              loop: sortedImages.length > 1,
            }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent className="w-full" dir="ltr">
              {sortedImages.map((image, index) => (
                <CarouselItem key={image.id || index}>
                  <div className="relative h-80 w-full overflow-hidden rounded-lg">
                    <div
                      className={cn(
                        "relative w-full h-full transition-all duration-150 ease-out",
                        hoveredImageIndex === index && mousePosition ? "scale-150" : "scale-100"
                      )}
                      style={hoveredImageIndex === index && mousePosition ? {
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                      } : undefined}
                    >
                      <CachedImage
                        src={image.full_url || image.url || "/images/images/placeholder.svg"}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index === 0}
                        onError={() => setImageErrors(prev => new Set(prev).add(index))}
                      />
                    </div>
                    {/* Overlay effect for hovered image */}
                    {hoveredImageIndex === index && (
                      <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />
                    )}

                    {/* Error overlay for failed images */}
                    {imageErrors.has(index) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center"></div>
                        <div className="w-20 h-20 flex-col mx-auto mb-2 rounded-lg bg-gray-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs mt-2 text-muted-foreground">
                            {locale === 'ar' ? 'فشل التحميل' : 'Failed to load'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => carouselApi?.scrollPrev()}
                  className="absolute ltr:left-2 rtl:right-2 rtl:rotate-180 rotate-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => carouselApi?.scrollNext()}
                  className="absolute ltr:right-2 rtl:left-2 rtl:rotate-180 rotate-0 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </Carousel>

          {/* Badge - Top Right */}
          {badge && (
            <div className={cn(
              "absolute rounded-full text-sm font-medium  text-foreground shadow-md z-10",
              "top-4 ltr:left-6 ltr:right-6 mx-4",
              "px-4 py-1.5 bg-[#D8F2EB]",
            )}>
              {badge}
            </div>
          )}
          {ribon_text &&
            <div className={cn(
              "absolute rounded-full text-sm font-medium  text-foreground shadow-md z-10",
              "top-4 ltr:left-6 ltr:right-6 mx-4",
              `bg-[${ribon_color}]`,
            )}>
              <TvIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{ribon_text}</span>
            </div>
          }

          {/* Action Buttons - Top Right */}
          <div className="absolute top-4 ltr:right-4 rtl:left-4 flex gap-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleFavorite}
              disabled={isLoading}
              className={cn(
                "h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-md transition-colors",
                isFavorite && "text-destructive",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isFavorite ?
                <HeartFillIcon className={cn("h-5 w-5 text-red-500")} />
                : <HeartIcon className={cn("h-5 w-5 text-muted-foreground hover:text-red-500")} />
              }
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md"
            >
              <ShareIcon className="!h-5 !w-5" />
            </Button>
          </div>

          {/* Zoom Button - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoom}
              className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
          {/* Image Counter */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-black/50 text-white z-10">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 items-center">
            <Carousel
              setApi={setThumbnailCarouselApi}
              opts={{
                align: "start",
                dragFree: true,
                containScroll: "trimSnaps",
                skipSnaps: true,
              }}
              className="flex-1 min-w-0"
            >
              <CarouselContent className="gap-2 rtl:justify-end">
                {sortedImages.slice(0, 4).map((image, index) => (
                  <CarouselItem key={image.id || index} className="basis-auto">
                    <button
                      onClick={() => scrollToIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
                        currentIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <CachedImage
                        src={image.full_url || image.url || "/images/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={() => setImageErrors(prev => new Set(prev).add(index))}
                      />
                      {imageErrors.has(index) && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-2xl">
                          <div className="flex flex-col items-center">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs mt-1 text-muted-foreground">
                              {locale === 'ar' ? 'فشل' : 'Failed'}
                            </p>
                          </div>
                        </div>
                      )}
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {sortedImages.length > 4 && (
              <button
                onClick={handleOpenAllImagesDialog}
                className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-foreground/90 text-background flex items-center justify-center text-sm font-bold hover:bg-foreground transition-colors cursor-pointer"
              >
                +{sortedImages.length - 4} {locale === 'ar' ? 'صورة' : 'images'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
      <FullscreenImageViewer
        images={sortedImages}
        initialIndex={currentIndex}
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        locale={locale}
        onIndexChange={(index) => {
          setCurrentIndex(index)
          scrollToIndex(index)
        }}
      />

      {/* All Images Dialog */}
      <Dialog open={showAllImagesDialog} onOpenChange={setShowAllImagesDialog}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {locale === 'ar' ? `جميع الصور (${sortedImages.length})` : `All Images (${sortedImages.length})`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-6 mt-4">
            {sortedImages.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => handleSelectImageFromDialog(index)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group",
                  currentIndex === index
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-transparent hover:border-primary/50 hover:scale-105"
                )}
              >
                <CachedImage
                  src={image.full_url || image.url || "/images/placeholder.svg"}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  onError={() => setImageErrors(prev => new Set(prev).add(index))}
                />
                {imageErrors.has(index) && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-xl">
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs mt-1 text-muted-foreground">
                        {locale === 'ar' ? 'فشل' : 'Failed'}
                      </p>
                    </div>
                  </div>
                )}
                {currentIndex === index && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-medium">
                      {locale === 'ar' ? 'الحالية' : 'Current'}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
