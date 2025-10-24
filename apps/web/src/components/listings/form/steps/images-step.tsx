"use client"

import { useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload, Star } from "lucide-react"
import type { ListingFormData } from "../types"

interface ImagesStepProps {
  onNext: () => void
  onPrevious: () => void
}

export function ImagesStep({ onNext, onPrevious }: ImagesStepProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<ListingFormData>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const media = watch("media") || []
  const coverImageIndex = watch("cover_image_index") || 0

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = [...media, ...files].slice(0, 20)
    setValue("media", newImages)

    const newUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => [...prev, ...newUrls].slice(0, 20))
  }

  const handleRemoveImage = (index: number) => {
    const newImages = media.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)

    setValue("media", newImages)
    setValue("cover_image_index", 
      coverImageIndex === index 
        ? 0 
        : coverImageIndex > index 
          ? coverImageIndex - 1 
          : coverImageIndex
    )
    setPreviewUrls(newUrls)
  }

  const handleSetCoverImage = (index: number) => {
    setValue("cover_image_index", index)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                اضغط لرفع الصور أو اسحبها هنا
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                PNG, JPG, GIF حتى 10MB (حد أقصى 20 صورة)
              </span>
            </Label>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="mt-4"
          >
            اختيار الصور
          </Button>
        </div>

        {media.length === 0 && (
          <p className="text-xs text-destructive text-right">
            يجب رفع صورة واحدة على الأقل
          </p>
        )}
      </div>

      {/* Image Previews */}
      {media.length > 0 && (
        <div className="space-y-4">
          <Label className="text-right block text-lg font-semibold">
            الصور المرفوعة ({media.length}/20)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {media.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={previewUrls[index] || URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Cover Image Badge */}
                {index === coverImageIndex && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Set Cover Button */}
                {index !== coverImageIndex && (
                  <Button
                    type="button"
                    onClick={() => handleSetCoverImage(index)}
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    غلاف
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
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
          disabled={media.length === 0}
          className="flex-1 h-12 text-base font-bold rounded-xl"
        >
          التالي
        </Button>
      </div>
    </form>
  )
}
