"use client"

import { useState } from "react"
import { Heart, Share2, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface PropertyGalleryProps {
  images: string[]
  badge?: string
}

export function PropertyGallery({ images, badge }: PropertyGalleryProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="space-y-3">
      {/* Main Image Carousel */}
      <div className="relative rounded-3xl overflow-hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          onSelect={(index) => setCurrentIndex(index)}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-80">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Badge - Top Right */}
          {badge && (
            <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium bg-white/95 text-foreground border border-border shadow-md z-10">
              {badge}
            </div>
          )}

          {/* Action Buttons - Top Left */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "h-10 w-10 rounded-full bg-white/95 hover:bg-white shadow-md transition-colors",
                isFavorite ? "text-destructive" : "text-foreground",
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Zoom Buttons - Bottom Right */}
          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full bg-white/95 hover:bg-white text-foreground shadow-md"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
        </Carousel>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.slice(0, 4).map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
              currentIndex === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent opacity-60 hover:opacity-100",
            )}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
        {images.length > 4 && (
          <button className="flex-shrink-0 w-20 h-20 rounded-2xl bg-foreground/90 text-background flex items-center justify-center text-sm font-bold">
            +{images.length - 4} صورة
          </button>
        )}
      </div>
    </div>
  )
}
