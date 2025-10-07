"use client"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Heart, TvIcon, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ShareIcon } from "../icons/share"

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
}

export function PropertyGallery({ images = [], coverImage, badge, locale = 'ar', isFavorite: initialFavorite = false, listingId, ribon_text, ribon_color }: PropertyGalleryProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [showFullscreen, setShowFullscreen] = useState(false)

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

  const scrollToIndex = (index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index)
    }
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
      const { isError, data } = await api.post(`/user/listings/${listingId}/toggle-favorite`)
      if (!isError && data.success) {
        setIsFavorite(!isFavorite)
      }
      console.log(data);

      toast.success(data.message)
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
      <div className="relative h-80 rounded-3xl overflow-hidden bg-muted/50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">
            {locale === 'ar' ? 'لا توجد صور متاحة' : 'No images available'}
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
                  <div className="relative h-80 w-full">
                    <Image
                      src={image.full_url || image.url || "/images/images/placeholder.svg"}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                    />
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
                isFavorite ? "text-destructive" : "text-foreground",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-red")} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md"
            >
              <ShareIcon className="h-5 w-5" />
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
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
                    currentIndex === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={image.full_url || image.url || "/images/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
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
              <Image
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
