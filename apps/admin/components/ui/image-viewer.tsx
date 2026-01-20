"use client"

import React, { useState } from "react"
import Image, { ImageProps } from "next/image"
import { Play, X, ZoomIn, ZoomOut } from "lucide-react"

interface ImageViewerProps extends Omit<ImageProps, 'src' | 'alt'> {
  src?: string | null
  alt?: string | null
  fallbackSrc?: string
  useProxy?: boolean
  baseUrl?: string
  isVideo?: boolean
  videoUrl?: string
}

export default function ImageViewer({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  useProxy = false,
  baseUrl,
  isVideo = false,
  videoUrl,
  onError,
  quality = 90,
  loading = 'lazy',
  fill = false,
  className,
  ...rest
}: ImageViewerProps) {
  const [hasError, setHasError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const defaultBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "https://ajar-backend.mystore.social"
  const storageBaseUrl = baseUrl || defaultBaseUrl

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    if (onError) onError(e)
  }

  const buildImageUrl = (image: string | null): string | null => {
    if (!image) return null
    if (image.startsWith('http')) {
      return useProxy ? `/api/proxy-image?url=${encodeURIComponent(image)}` : image
    }
    const fullUrl = `${storageBaseUrl}/storage/${image}`
    return useProxy ? `/api/proxy-image?url=${encodeURIComponent(fullUrl)}` : fullUrl
  }

  const finalSrc = hasError || !src ? fallbackSrc : (buildImageUrl(src) || fallbackSrc)

  const isYouTube = (u?: string) => !!u && (u.includes('youtube.com') || u.includes('youtu.be'))

  return (
    <>
      <div className={`relative overflow-hidden ${className || ''}`}>
        {isVideo ? (
          <div className="relative w-full h-full bg-black">
            <img
              src={finalSrc}
              alt={alt || 'video thumbnail'}
              className="object-cover w-full h-full"
              onError={(e) => handleError(e as any)}
            />
            <button
              aria-label="Play video"
              onClick={() => setIsOpen(true)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            >
              <Play className="h-8 w-8 text-white" />
            </button>
          </div>
        ) : (
          <button className="block w-full h-full" onClick={() => setIsOpen(true)}>
            <Image
              src={finalSrc}
              alt={alt || 'image'}
              onError={(e) => handleError(e as any)}
              quality={quality}
              loading={loading}
              fill={fill}
              className={className as string}
              {...(rest as any)}
            />
          </button>
        )}
      </div>

      {/* Fullscreen viewer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setIsOpen(false)}>
          <div className="relative max-w-[95vw] max-h-[95vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="close"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-50 rounded-full bg-white/10 hover:bg-white/20 p-2"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {isVideo ? (
              <div className="w-full h-[70vh] bg-black">
                {videoUrl && isYouTube(videoUrl) ? (
                  <iframe
                    src={videoUrl.includes('youtube') ? (videoUrl.includes('embed') ? videoUrl : (() => {
                      if (videoUrl.includes('watch?v=')) {
                        const id = videoUrl.split('v=')[1]?.split('&')[0]
                        return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
                      }
                      if (videoUrl.includes('youtu.be/')) {
                        const id = videoUrl.split('youtu.be/')[1]?.split('?')[0]
                        return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
                      }
                      return videoUrl
                    })()) : videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="video player"
                  />
                ) : (
                  <video className="w-full h-full" controls autoPlay>
                    <source src={videoUrl} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={finalSrc}
                  alt={alt || 'image'}
                  className={`${zoomed ? 'max-w-none scale-125' : 'max-w-full'} block mx-auto max-h-[85vh] object-contain`}
                  onError={(e) => handleError(e as any)}
                />

                <div className="absolute bottom-3 left-3 flex gap-2">
                  <button
                    aria-label="zoom"
                    onClick={() => setZoomed(z => !z)}
                    className="rounded-full bg-white/10 hover:bg-white/20 p-2"
                  >
                    {zoomed ? <ZoomOut className="w-4 h-4 text-white" /> : <ZoomIn className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
