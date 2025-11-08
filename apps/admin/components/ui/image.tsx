"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"

interface ImagesProps extends Omit<ImageProps, 'src' | 'alt' | 'title'> {
    src: string | null
    alt?: string | null
    fallbackSrc?: string
    useProxy?: boolean
    baseUrl?: string
    fill?: boolean
}

export default function Images({
    src,
    fallbackSrc = "/placeholder.svg",
    useProxy = false,
    baseUrl,
    onError,
    quality = 90,
    priority,
    loading = 'lazy',
    sizes,
    alt,
    fill = true,
    ...rest
}: ImagesProps) {
    const [hasError, setHasError] = useState(false)
    
    const defaultBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "https://ajar-backend.mystore.social"
    const storageBaseUrl = baseUrl || defaultBaseUrl
    
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setHasError(true)
        if (onError) {
            onError(e)
        }
    }

    // بناء رابط الصورة
    const buildImageUrl = (image: string | null): string | null => {
        if (!image) return null
        
        // إذا كان الرابط كامل بالفعل
        if (image.startsWith('http')) {
            return useProxy ? `/api/proxy-image?url=${encodeURIComponent(image)}` : image
        }
        
        // بناء الرابط من storage
        const fullUrl = `${storageBaseUrl}/storage/${image}`
        return useProxy ? `/api/proxy-image?url=${encodeURIComponent(fullUrl)}` : fullUrl
    }

    // تحديد الصورة النهائية
    const imageSrc = hasError || !src
        ? fallbackSrc
        : buildImageUrl(src) || fallbackSrc

    return (
        <Image
            src={imageSrc}
            alt={alt || "صورة العقار"}
            onError={handleError}
            quality={quality}
            priority={priority}
            loading={loading}
            sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            fill={fill}
            {...rest}
        />
    )
}