"use client"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import CachedImage from "../CachedImage"

interface GalleryImage {
    id: number
    url: string
    full_url: string
    sort_order: number
}

interface FullscreenImageViewerProps {
    images: GalleryImage[]
    initialIndex: number
    isOpen: boolean
    onClose: () => void
    locale?: string
    onIndexChange?: (index: number) => void
}

export function FullscreenImageViewer({
    images,
    initialIndex,
    isOpen,
    onClose,
    locale = 'ar',
    onIndexChange
}: FullscreenImageViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [thumbnailCarouselApi, setThumbnailCarouselApi] = useState<CarouselApi>()
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
    const isDraggingRef = useRef(false)
    const isUserScrollingRef = useRef(false)
    const shouldSyncRef = useRef(true)

    // Update current index when initialIndex changes
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex)
        }
    }, [initialIndex, isOpen])


    const handlePrevious = () => {
        const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
        shouldSyncRef.current = true
        isUserScrollingRef.current = false
        setCurrentIndex(newIndex)
        onIndexChange?.(newIndex)
        // Scroll thumbnail to new index - use scrollTo without jump
        if (thumbnailCarouselApi) {
            thumbnailCarouselApi.scrollTo(newIndex)
        }
    }

    const handleNext = () => {
        const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
        shouldSyncRef.current = true
        isUserScrollingRef.current = false
        setCurrentIndex(newIndex)
        onIndexChange?.(newIndex)
        // Scroll thumbnail to new index - use scrollTo without jump
        if (thumbnailCarouselApi) {
            thumbnailCarouselApi.scrollTo(newIndex)
        }
    }

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
                setCurrentIndex(newIndex)
                onIndexChange?.(newIndex)
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
                setCurrentIndex(newIndex)
                onIndexChange?.(newIndex)
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, currentIndex, images.length, onClose, onIndexChange])

    // Touch/swipe navigation for mobile
    const touchStartX = useRef<number | null>(null)
    const touchEndX = useRef<number | null>(null)

    const minSwipeDistance = 50

    const onTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null
        touchStartX.current = e.targetTouches[0].clientX
    }

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX
    }

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return
        const distance = touchStartX.current - touchEndX.current
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe) {
            handleNext()
        } else if (isRightSwipe) {
            handlePrevious()
        }
    }

    // Don't auto-sync - only sync on explicit user actions (click, navigation buttons)
    // This prevents the carousel from snapping back when user scrolls

    // Listen to thumbnail carousel changes - only update main image when user clicks thumbnail
    // Don't update during scroll/drag to allow free scrolling
    useEffect(() => {
        if (!thumbnailCarouselApi) return

        // Only update when user explicitly selects a thumbnail (not during drag)
        // We'll handle clicks separately in handleThumbnailClick
        // This effect is mainly for cleanup
    }, [thumbnailCarouselApi])

    const handleThumbnailClick = (index: number) => {
        shouldSyncRef.current = true
        isUserScrollingRef.current = false
        setCurrentIndex(index)
        onIndexChange?.(index)
        // Scroll to clicked thumbnail - use scrollTo without jump to allow smooth scroll
        if (thumbnailCarouselApi) {
            thumbnailCarouselApi.scrollTo(index)
        }
    }

    if (images.length === 0) return null

    const currentImage = images[currentIndex]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="!max-w-full w-full h-[100vh] max-h-[100vh] p-0 gap-0 bg-black/95 backdrop-blur-sm border-0 rounded-none"
                showCloseButton={false}
            >
                <div className="flex flex-col h-full w-full relative">

                    {/* Main Image Container */}
                    <div 
                        className="flex-1 flex items-center justify-center overflow-hidden relative touch-pan-y"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-8">
                            <CachedImage
                                src={currentImage?.full_url || currentImage?.url || "/images/placeholder.svg"}
                                alt={`Image ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                                onError={() => setImageErrors(prev => new Set(prev).add(currentIndex))}
                            />

                            {/* Error overlay */}
                            {imageErrors.has(currentIndex) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="text-center text-white">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-lg">
                                            {locale === 'ar' ? 'فشل تحميل الصورة' : 'Failed to load image'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handlePrevious}
                                    className={cn(
                                        "absolute top-1/2 -translate-y-1/2 rounded-full",
                                        "bg-white/20 hover:bg-white/30 backdrop-blur-md",
                                        "transition-all z-20 shadow-lg",
                                        "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
                                        "ltr:left-2 sm:ltr:left-4 rtl:right-2 sm:rtl:right-4"
                                    )}
                                    aria-label={locale === 'ar' ? 'السابق' : 'Previous'}
                                >
                                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleNext}
                                    className={cn(
                                        "absolute top-1/2 -translate-y-1/2 rounded-full",
                                        "bg-white/20 hover:bg-white/30 backdrop-blur-md",
                                        "transition-all z-20 shadow-lg",
                                        "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
                                        "ltr:right-2 sm:ltr:right-4 rtl:left-2 sm:rtl:left-4"
                                    )}
                                    aria-label={locale === 'ar' ? 'التالي' : 'Next'}
                                >
                                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Bar */}
                    {images.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-2 sm:pb-4 pt-4 sm:pt-8">
                            <div className="text-white text-xs sm:text-sm font-medium mx-auto w-full text-center mb-2 sm:mb-3">
                                {currentIndex + 1} / {images.length}
                            </div>
                            <Carousel
                                setApi={setThumbnailCarouselApi}
                                opts={{
                                    dragFree: true,
                                    containScroll: "trimSnaps",
                                    skipSnaps: true,
                                }}
                                className="w-full"
                            >
                                <CarouselContent className="gap-2 sm:gap-3 px-2 sm:px-4 py-2 justify-center">
                                    {images.map((image, index) => (
                                        <CarouselItem key={image.id || index} className="basis-auto">
                                            <button
                                                onClick={() => handleThumbnailClick(index)}
                                                className={cn(
                                                    "relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer group",
                                                    "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20",
                                                    currentIndex === index
                                                        ? "border-white ring-2 ring-white/50 scale-110 shadow-lg"
                                                        : "border-white/30 hover:border-white/60 opacity-70 hover:opacity-100"
                                                )}
                                                aria-label={`${locale === 'ar' ? 'صورة' : 'Image'} ${index + 1}`}
                                            >
                                                <CachedImage
                                                    src={image.full_url || image.url || "/images/placeholder.svg"}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                    onError={() => setImageErrors(prev => new Set(prev).add(index))}
                                                />
                                                {imageErrors.has(index) && (
                                                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {currentIndex === index && (
                                                    <div className="absolute inset-0 bg-white/10" />
                                                )}
                                            </button>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </div>
                    )}

                    {/* Header with close button */}
                    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-end p-2 sm:p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onClose}
                            className={cn(
                                "rounded-full backdrop-blur-md transition-all shadow-lg",
                                "bg-white/20 hover:bg-white/30 text-white",
                                "h-9 w-9 sm:h-10 sm:w-10"
                            )}
                            aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
                        >
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

