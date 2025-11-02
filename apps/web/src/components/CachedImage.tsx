"use client"
import Image, { ImageProps } from "next/image"
import { useState } from "react"

interface CachedImageProps extends ImageProps {
    fallbackSrc?: string
    useProxy?: boolean
}

export default function CachedImage({
    src,
    alt,
    fallbackSrc = "/placeholder.svg",
    useProxy = true,
    onError,
    quality = 100,
    ...rest
}: CachedImageProps) {
    const [hasError, setHasError] = useState(false)

    const handleError = (e: any) => {
        setHasError(true)
        if (onError) {
            onError(e)
        }
    }

    // إذا تم تفعيل useProxy، يتم إعادة بناء رابط الصورة باستخدام /api/proxy-image
    const imageSrc = hasError || !src
        ? fallbackSrc
        : (src as string)
    // : `/api/proxy-image?url=${encodeURIComponent(src as string)}`


    return (
        <Image
            src={imageSrc}
            alt={alt || "Image"}
            onError={handleError}
            {...rest}
            quality={quality}
        />
    )
}
