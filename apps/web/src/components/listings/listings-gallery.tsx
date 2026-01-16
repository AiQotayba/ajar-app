"use client"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, TvIcon, VideoIcon, ZoomIn, ZoomOut, Play } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ShareIcon } from "../icons/share"
import { shareContent } from "@/components/shared/share-content"
import { HeartIcon } from "../icons/heart"
import { HeartFillIcon } from "../icons/heart-fill"
import CachedImage from "../CachedImage"
import { FullscreenImageViewer } from "./fullscreen-image-viewer"

interface GalleryMedia {
  id: number
  type: 'image' | 'video'
  url: string
  full_url: string
  sort_order: number
  iframely?: {
    url?: string
    meta?: {
      site?: string
      title?: string
    }
    html?: string
    thumbnail?: {
      href: string
    }
  } | null
}

interface ListingsGalleryProps {
  images?: GalleryMedia[]
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
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)

  // Prepare media array
  const allMedia = images

  // Sort media by sort_order
  const sortedMedia = allMedia.sort((a, b) => a.sort_order - b.sort_order)

  useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      const newIndex = carouselApi.selectedScrollSnap()
      setCurrentIndex(newIndex)
      // Pause any playing video when changing slide
      if (playingVideo !== null && playingVideo !== newIndex) {
        setPlayingVideo(null)
      }
    }

    carouselApi.on("select", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi, playingVideo])

  // Sync thumbnail carousel with current index
  useEffect(() => {
    if (thumbnailCarouselApi && currentIndex < 4) {
      thumbnailCarouselApi.scrollTo(currentIndex)
    }
  }, [currentIndex, thumbnailCarouselApi])

  // Auto-play effect (only for images, not videos)
  useEffect(() => {
    if (!isAutoPlaying || sortedMedia.length <= 1 || playingVideo !== null) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % sortedMedia.length
        if (carouselApi) {
          carouselApi.scrollTo(nextIndex)
        }
        return nextIndex
      })
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, sortedMedia.length, carouselApi, playingVideo])

  const scrollToIndex = (index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index)
    }
  }

  const handleOpenAllImagesDialog = () => {
    setShowAllImagesDialog(true)
  }

  const handleSelectImageFromDialog = (index: number) => {
    scrollToIndex(index)
    setShowAllImagesDialog(false)
    setShowFullscreen(true)
  }

  const handleShare = async () => {
    const listingUrl = window.location.href
    const mainImage = coverImage || (sortedMedia[0]?.full_url || sortedMedia[0]?.url)
    const imageUrl = mainImage || undefined

    if (!listingData) {
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
    const currentMedia = sortedMedia[currentIndex]
    if (currentMedia.type === 'image') {
      setShowFullscreen(true)
    } else {
      // For videos, open in new tab or play inline
      if (currentMedia.iframely?.url) {
        window.open(currentMedia.iframely.url, '_blank')
      }
    }
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
        const action = data?.data?.action

        if (action === 'added') {
          setIsFavorite(true)
          setFavoritesCount(prev => prev + 1)
        } else if (action === 'removed') {
          setIsFavorite(false)
          setFavoritesCount(prev => Math.max(0, prev - 1))
        }

        if (onFavoriteToggle) {
          onFavoriteToggle(isFavorite, favoritesCount)
        }

        toast.success(data.message)
      } else {
        toast.error(data.message || (locale === 'ar' ? 'حدث خطأ في تحديث المفضلة' : 'Error updating favorites'))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(locale === 'ar' ? 'حدث خطأ في تحديث المفضلة' : 'Error updating favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVideoPlay = (index: number) => {
    if (playingVideo === index) {
      setPlayingVideo(null)
    } else {
      setPlayingVideo(index)
      // Stop auto-play when video starts
      setIsAutoPlaying(false)
    }
  }

  const getVideoThumbnail = (media: GalleryMedia) => {
    if (media.iframely?.thumbnail?.href) {
      return media.iframely.thumbnail.href
    }
    return media.full_url || media.url
  }

  const getVideoUrl = (media: GalleryMedia) => {
    if (media.iframely?.url) {
      return media.iframely.url
    }
    return media.full_url || media.url
  }

  const isYouTubeVideo = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }
    return url
  }

  // Don't render if no media
  if (sortedMedia.length === 0) {
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
        {/* Main Media Carousel */}
        <div className="relative rounded-3xl overflow-hidden bg-muted/50">
          <Carousel
            opts={{
              align: "start",
              loop: sortedMedia.length > 1,
            }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent className="w-full" dir="ltr">
              {sortedMedia.map((media, index) => (
                <CarouselItem key={media.id || index}>
                  <div className="relative h-80 w-full overflow-hidden rounded-lg">
                    {media.type === 'video' ? (
                      // Video Player
                      <div className="relative w-full h-full bg-black">
                        {playingVideo === index ? (
                          // Video Player - Playingلس
                          <div className="w-full h-full">
                            {isYouTubeVideo(getVideoUrl(media)) ? (
                              <iframe
                                src={getYouTubeEmbedUrl(getVideoUrl(media))}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Video player"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-white text-center">
                                  <VideoIcon className="h-12 w-12 mx-auto mb-2" />
                                  <p className="text-sm">
                                    {locale === 'ar' ? 'فيديو غير مدعوم للعرض المباشر' : 'Video not supported for inline playback'}
                                  </p>
                                  <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => window.open(getVideoUrl(media), '_blank')}
                                  >
                                    {locale === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new window'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Video Thumbnail with Play Button
                          <div className="relative w-full h-full">
                            <CachedImage
                              src={getVideoThumbnail(media)}
                              alt="Video thumbnail"
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              onError={() => setImageErrors(prev => new Set(prev).add(index))}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleVideoPlay(index)}
                                className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                              >
                                <Play className="h-8 w-8 text-white fill-white" />
                              </Button>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs flex items-center gap-1">
                              <VideoIcon className="h-3 w-3" />
                              {media.iframely?.meta?.site || 'Video'}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Image
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
                          src={media.full_url || media.url || "/images/images/placeholder.svg"}
                          alt={`Property image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                          onError={() => setImageErrors(prev => new Set(prev).add(index))}
                        />
                        {hoveredImageIndex === index && (
                          <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />
                        )}
                      </div>
                    )}

                    {/* Error overlay for failed media */}
                    {imageErrors.has(index) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="text-center">
                          <svg className="w-8 h-8 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {sortedMedia.length > 1 && (
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
              "absolute rounded-full text-sm font-medium text-foreground shadow-md z-10",
              "top-4 ltr:left-6 rtl:right-6 mx-4",
              "px-4 py-1.5 bg-[#D8F2EB]",
            )}>
              {badge}
            </div>
          )}
          {ribon_text && (
            <div className={cn(
              "absolute rounded-full text-sm font-medium text-foreground shadow-md z-10",
              "top-4 ltr:left-6 rtl:right-6 mx-4",
              `bg-[${ribon_color}]`,
            )}>
              <TvIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{ribon_text}</span>
            </div>
          )}

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

          {/* Zoom/Play Button - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleZoom}
              className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md"
            >
              {sortedMedia[currentIndex]?.type === 'video' ? (
                <Play className="h-5 w-5" />
              ) : (
                <ZoomIn className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Media Counter */}
          {sortedMedia.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-black/50 text-white z-10">
              {currentIndex + 1} / {sortedMedia.length}
            </div>
          )}

          {/* Media Type Indicator */}
          {/* <div className="absolute top-4 left-4 px-2 py-1 rounded-md bg-black/60 text-white text-xs flex items-center gap-1 z-10">
            {sortedMedia[currentIndex]?.type === 'video' ? (
              <>
                <VideoIcon className="h-3 w-3" />
                <span>Video</span>
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Image</span>
              </>
            )}
          </div> */}
        </div>

        {/* Thumbnail Gallery */}
        {sortedMedia.length > 1 && (
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
                {sortedMedia.slice(0, 4).map((media, index) => (
                  <CarouselItem key={media.id || index} className="basis-auto">
                    <button
                      onClick={() => scrollToIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group",
                        currentIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      {media.type === 'video' ? (
                        <>
                          <CachedImage
                            src={getVideoThumbnail(media)}
                            alt="Video thumbnail"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            onError={() => setImageErrors(prev => new Set(prev).add(index))}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <VideoIcon className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <CachedImage
                          src={media.full_url || media.url || "/images/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          onError={() => setImageErrors(prev => new Set(prev).add(index))}
                        />
                      )}
                      
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

                      {/* Media type indicator on thumbnail */}
                      {/* {media.type === 'video' && (
                        <div className="absolute bottom-1 right-1 bg-black/70 rounded-full p-1">
                          <VideoIcon className="h-3 w-3 text-white" />
                        </div>
                      )} */}
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {sortedMedia.length > 4 && (
              <button
                onClick={handleOpenAllImagesDialog}
                className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-foreground/90 text-background flex items-center justify-center text-sm font-bold hover:bg-foreground transition-colors cursor-pointer"
              >
                +{sortedMedia.length - 4} {locale === 'ar' ? 'عنصر' : 'items'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Image Viewer (only for images) */}
      {showFullscreen && sortedMedia[currentIndex]?.type === 'image' && (
        <FullscreenImageViewer
          images={sortedMedia.filter(m => m.type === 'image')}
          initialIndex={sortedMedia.slice(0, currentIndex + 1).filter(m => m.type === 'image').length - 1}
          isOpen={showFullscreen}
          onClose={() => setShowFullscreen(false)}
          locale={locale}
          onIndexChange={(imageIndex) => {
            // Find the actual index in sortedMedia
            const imageItems = sortedMedia.filter(m => m.type === 'image')
            if (imageIndex >= 0 && imageIndex < imageItems.length) {
              const actualIndex = sortedMedia.findIndex(m => m.id === imageItems[imageIndex].id)
              if (actualIndex !== -1) {
                setCurrentIndex(actualIndex)
                scrollToIndex(actualIndex)
              }
            }
          }}
        />
      )}

      {/* All Media Dialog */}
      <Dialog open={showAllImagesDialog} onOpenChange={setShowAllImagesDialog}>
        <DialogContent className="max-w-[98vw] w-full h-[95vh] max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {locale === 'ar' ? `جميع الوسائط (${sortedMedia.length})` : `All Media (${sortedMedia.length})`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
            {sortedMedia.map((media, index) => (
              <button
                key={media.id || index}
                onClick={() => {
                  handleSelectImageFromDialog(index)
                  if (media.type === 'video') {
                    toggleVideoPlay(index)
                  }
                }}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group",
                  currentIndex === index
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-transparent hover:border-primary/50 hover:scale-105"
                )}
              >
                {media.type === 'video' ? (
                  <>
                    <CachedImage
                      src={getVideoThumbnail(media)}
                      alt="Video thumbnail"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      onError={() => setImageErrors(prev => new Set(prev).add(index))}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                    {/* <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs flex items-center gap-1">
                      <VideoIcon className="h-3 w-3" />
                      Video
                    </div> */}
                  </>
                ) : (
                  <CachedImage
                    src={media.full_url || media.url || "/images/placeholder.svg"}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    onError={() => setImageErrors(prev => new Set(prev).add(index))}
                  />
                )}
                
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