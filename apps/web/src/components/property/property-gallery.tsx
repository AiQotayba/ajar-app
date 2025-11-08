"use client"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, TvIcon, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ShareIcon } from "../icons/share"
import { HeartIcon } from "../icons/heart"
import { HeartFillIcon } from "../icons/heart-fill"
import CachedImage from "../CachedImage"

interface GalleryImage {
  id: number
  url: string
  full_url: string
  sort_order: number
}

interface PropertyGalleryProps {
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
}

export function PropertyGallery({
  images = [],
  coverImage,
  badge,
  locale = 'ar',
  isFavorite: initialFavorite = false,
  listingId,
  ribon_text,
  ribon_color,
  favoritesCount: initialFavoritesCount = 0,
  onFavoriteToggle
}: PropertyGalleryProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount)
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // Prepare images array - use cover image as first if available, then add other images
  const allImages = coverImage
    ? [{ id: 0, url: coverImage, full_url: coverImage, sort_order: 0 }, ...images]
    : images

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

  const handleImageHover = (index: number, event: React.MouseEvent) => {
    setHoveredImageIndex(index)
    setIsAutoPlaying(false) // Stop auto-play when hovering

    // Calculate precise mouse position
    const position = calculateMousePosition(event)
    setMousePosition(position)

    // Change the main view image
    if (carouselApi) {
      carouselApi.scrollTo(index)
    }
  }

  const handleImageMouseMove = (event: React.MouseEvent) => {
    if (hoveredImageIndex === null) return

    // Throttle mouse move events for better performance
    requestAnimationFrame(() => {
      const position = calculateMousePosition(event)
      setMousePosition(position)
    })
  }

  const handleImageLeave = () => {
    setHoveredImageIndex(null)
    setMousePosition(null)
    setIsAutoPlaying(true) // Resume auto-play when leaving
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Property Listing',
          text: 'Check out this property listing',
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
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
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-row ">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide   rtl:justify-end">
              {sortedImages.slice(0, 4).map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => scrollToIndex(index)}
                  //  onMouseEnter={(e) => handleImageHover(index, e)}
                  //  onMouseMove={handleImageMouseMove}
                  //  onMouseLeave={handleImageLeave}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer",
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
              ))}
            </div>
            {sortedImages.length > 4 && (
              <button className="flex-shrink-0 w-20 h-20 rounded-2xl bg-foreground/90 text-background flex items-center justify-center text-sm font-bold">
                +{sortedImages.length - 4} {locale === 'ar' ? 'صورة' : 'images'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white z-10"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>

            <div className="relative w-full h-full flex items-center justify-center p-4">
              <CachedImage
                src={sortedImages[currentIndex]?.full_url || sortedImages[currentIndex]?.url || "/images/placeholder.svg"}
                alt={`Property image ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {/* Fullscreen Navigation */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => carouselApi?.scrollPrev()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white z-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => carouselApi?.scrollNext()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white z-10"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
