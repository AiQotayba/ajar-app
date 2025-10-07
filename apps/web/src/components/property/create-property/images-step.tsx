"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ImagePlus, Star, X } from "lucide-react"
import { useRef, useState } from "react"
import type { PropertyFormData } from "../create-property-form"

interface ImagesStepProps {
  data: PropertyFormData
  updateData: (data: Partial<PropertyFormData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function ImagesStep({ data, updateData, onNext, onPrevious }: ImagesStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = [...data.images, ...files].slice(0, 20)
    updateData({ images: newImages })

    // Create preview URLs
    const newUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newUrls].slice(0, 20))
  }

  const handleRemoveImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)

    updateData({
      images: newImages,
      coverImageIndex:
        data.coverImageIndex === index
          ? 0
          : data.coverImageIndex > index
            ? data.coverImageIndex - 1
            : data.coverImageIndex,
    })
    setPreviewUrls(newUrls)
  }

  const handleSetCover = (index: number) => {
    updateData({ coverImageIndex: index })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (data.images.length === 0) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          اختر صور واضحة وجذابة لتسهيل وصول المستأجرين أو المشترين لعقارك.
        </p>

        <div className="space-y-2 text-right">
          <p className="text-xs text-muted-foreground">• يمكنك رفع من 1 حتى 20 صورة.</p>
          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
            • حدد على <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 inline" /> لتعيين صورة الغلاف.
          </p>
        </div>

        {/* Images Grid */}
        {data.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                <img
                  src={url || "/images/placeholder.svg"}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 left-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>

                {/* Cover Star Button */}
                <button
                  type="button"
                  onClick={() => handleSetCover(index)}
                  className={cn(
                    "absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all",
                  )}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      data.coverImageIndex === index ? "fill-yellow-500 text-yellow-500" : "text-gray-400",
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {data.images.length < 20 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all flex flex-col items-center justify-center gap-3 text-primary",
              data.images.length === 0 ? "h-48" : "h-32 py-6",
            )}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ImagePlus className="h-8 w-8" />
            </div>
            <span className="font-medium">انقر لإضافة صور</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {data.images.length > 0 && (
          <p className="text-xs text-destructive text-center">
            الحد الأدنى لعدد الصور هو 5. قم بإضافة صورة واحدة على الأقل للمتابعة.
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onPrevious}
          variant="outline"
          className="flex-1 h-12 text-base font-bold rounded-xl bg-transparent"
        >
          السابق
        </Button>
        <Button
          type="submit"
          disabled={data.images.length === 0}
          className="flex-1 h-12 text-base font-bold rounded-xl"
        >
          التالي
        </Button>
      </div>
    </form>
  )
}
